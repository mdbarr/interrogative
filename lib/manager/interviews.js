'use strict';

const uuid = require('uuid/v4');
const { milliseconds } = require('barrkeep/utils');

function Interviews (manager) {
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
      object: 'interview',
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

    manager.utils.hidden(model, 'save', (callback) => {
      if (ephemeral) {
        return setImmediate(callback);
      }
      return manager.database.interviews.updateOne({ id: model.id },
        { $set: model },
        { upsert: true },
        callback);
    });

    manager.utils.hidden(model, 'update', () => {
      manager.queue.push({
        name: 'interview update',
        task: model.save
      });
    });

    manager.cache.add(model);

    return model;
  };

  //////////

  this.bootstrap = () => {
    console.log('Bootstrapping example interview:');
    const soon = Date.now() + milliseconds('2h');
    const example = this.model({
      owner: manager.users.administrator.id,
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
    if (manager.cache.has(id)) {
      return setImmediate(() => {
        return callback(null, manager.cache.get(id));
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
