'use strict';

const uuid = require('uuid/v4');
const { milliseconds } = require('barrkeep/utils');

function Interviews (manager) {
  this.cache = {
    store: new Map(),
    index: new Map(),
    save: (model) => {
      const entry = {
        model,
        ttl: model.ephemeral ? Infinity :
          Date.now() + milliseconds('6h')
      };
      this.cache.index.set(model, entry);
      for (const id of model.ids) {
        this.cache.store.set(id, model);
      }
    },
    interval: setInterval(() => {
      for (const [ model, entry ] of this.cache.index) {
        if (Date.now() > entry.ttl) {
          console.log(`[manager] purging ${ model.id } from cache`);

          for (const id of model.ids) {
            this.cache.store.delete(id);
          }
          this.cache.map.delete(model);
        }
      }
    }, milliseconds('5m')),
    has: (id) => {
      return this.cache.store.has(id);
    },
    get: (id) => {
      if (this.cache.store.has(id)) {
        const model = this.cache.store.get(id);
        const entry = this.cache.index.get(model);
        entry.ttl = Math.max(entry.ttl, Date.now() + milliseconds('6h'));
        return model;
      }
      return undefined;
    }
  };

  //////////

  this.model = ({
    id, owner, image = 'interrogative-container', volume,
    ids, start, stop, title, company, position, notes, users,
    home = '/home/user', open = [ 'WELCOME.md' ],
    git, repository, uploads, uploadsPath,
    buttons, keypairs,
    state, ephemeral = false
  }) => {
    const model = {
      id: id || uuid(),
      owner: owner || null,
      image,
      volume: volume || null,
      ids: ids || [],
      start,
      stop,
      title: title || '',
      company: company || '',
      position: position || '',
      notes: notes || '',
      users: users || [ ],
      home,
      open,
      git: git !== undefined ? git : true,
      repository: repository || home,
      uploads: uploads !== undefined ? uploads : true,
      uploadsPath: uploadsPath || manager.config.uploads.path,
      buttons: buttons || [ ],
      keypairs: keypairs || [ ],
      state: state || {
        path: null,
        container: {
          id: null,
          address: null,
          starting: false,
          ready: false
        }
      },
      ephemeral
    };

    if (!model.ids.includes(model.id)) {
      model.ids.push(model.id);
    }

    for (const user of users) {
      if (!user.id) {
        user.id = uuid();
      }

      if (!model.ids.includes(user.id)) {
        model.ids.push(user.id);
      }
    }

    let update = () => {};

    if (!ephemeral) {
      update = (callback) => {
        return manager.database.interviews.updateOne({ id: model.id },
          { $set: model },
          { upsert: true },
          callback);
      };
    }

    Object.defineProperty(model, 'update', {
      enumerable: false,
      value: () => {
        manager.queue.push({
          name: 'interview update',
          task: update
        });
      }
    });

    this.cache.save(model);

    return model;
  };

  //////////

  this.bootstrap = () => {
    console.log('Bootstrapping example interview:');
    const soon = Date.now() + milliseconds('2h');
    const example = this.model({
      start: soon,
      stop: soon + milliseconds('1h'),
      title: 'Test Interview',
      company: 'Hyperingenuity',
      position: 'Developer',
      users: [ {
        name: 'Hercules Armstrong',
        role: 'interviewer',
        email: 'hercules@hyperingenuity.com'
      }, {
        name: 'Gary Garrison',
        role: 'candidate',
        email: 'gary@hyperingenuity.com'
      }, {
        name: 'Felton Feldsmith',
        role: 'observer',
        email: 'felton@hyperingenuity.com'
      } ],
      ephemeral: true
    });

    console.pp(example);
    return example;
  };

  //////////

  this.load = (callback) => {
    if (manager.config.manager.bootstrap) {
      this.bootstrap();
    }

    setImmediate(callback);
  };

  //////////

  this.lookup = (id, callback) => {
    if (this.cache.has(id)) {
      return setImmediate(() => {
        return callback(null, this.cache.get(id));
      });
    }
    return manager.database.interviews.findOne({ ids: id }, (error, item) => {
      if (error) {
        return callback(error);
      }

      if (item) {
        const model = this.model(item);
        return callback(null, model);
      }
      return callback(`${ id } not found`);
    });
  };

  this.available = (id, model) => {
    for (const user of model.users) {
      if (user.id === id) {
        if (user.role === 'candidate') {
          const now = Date.now();
          if (now >= model.start && now <= model.end) {
            return true;
          }
          return false;
        }
        return true;
      }
    }
    return false;
  };

  this.ready = (id, callback) => {
    this.lookup(id, (error, model) => {
      if (error) {
        return callback(error);
      }
      if (!this.available(id, model)) {
        return callback(`${ id } not available`);
      }

      if (!model.state.container.id) {
        if (!model.state.container.starting) {
          model.state.container.starting = true;
          return manager.docker.boot(model, (error) => {
            if (error) {
              return callback(error);
            }

            const interval = setInterval(() => {
              if (model.state.container.ready) {
                clearInterval(interval);
                return callback(null, model);
              }
              return false;
            }, 500);

            return interval;
          });
        }
        const interval = setInterval(() => {
          if (model.state.container.ready) {
            clearInterval(interval);
            return callback(null, model);
          }
          return false;
        }, 500);

        return interval;
      }
      return callback(null, model);
    });
  };
}

module.exports = function(manager) {
  return new Interviews(manager);
};
