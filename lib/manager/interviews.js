'use strict';

const uuid = require('uuid/v4');
const errors = require('restify-errors');
const { milliseconds } = require('barrkeep/utils');

function Interviews (manager) {
  this.model = ({
    id, ids, owner, image = 'interrogative-container', volume,
    start, stop, duration,
    title, company, position, notes, users,
    home = '/home/user', open = [ 'WELCOME.md' ],
    git, repository, uploads, uploadsPath,
    buttons, keypairs,
    state, ephemeral = false
  }) => {
    if (duration && !stop) {
      stop = start + duration;
    }

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

    if (!model.volume) {
      model.volume = `interrogative-${ model.id.replace(/-/g, '') }-data`;
    }

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
      duration: milliseconds('1h'),
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
        name: 'Administrator',
        role: 'observer',
        email: manager.users.administrator.email
      } ]
    });

    console.pp(example);
    return example;
  };

  //////////

  this.load = (callback) => {
    manager.database.interviews.find().count((error, count) => {
      if (error) {
        return callback(error);
      }

      if (count === 0 && manager.config.manager.bootstrap) {
        return this.bootstrap().save(callback);
      }

      return setImmediate(callback);
    });
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

  //////////

  this.create = (req, res, next) => {
    if (!req.body || !req.body.title && !req.body.users) {
      return next(new errors.BadRequestError('Malformed interviwe'));
    }

    req.body.owner = req.authorization.user.id;

    const model = this.model(req.body);

    return model.save((error) => {
      if (error) {
        return next(new errors.InternalServerError(error));
      }

      res.send(200, model);
      return next();
    });
  };

  this.list = (upcoming, req, res, next) => {
    const response = {
      items: [],
      count: 0
    };

    const filter = {
      owner: req.authorization.user.id,
      stop: upcoming ? { $gt: Date.now() } : { $lte: Date.now() }
    };

    return manager.database.interviews.find(filter).toArray((error, items) => {
      if (error) {
        return next(new errors.InternalServerError(error));
      }

      if (items) {
        response.items = items;
        response.count = items.length;
      }

      res.send(200, response);
      return next();
    });
  };

  this.upcoming = (req, res, next) => {
    return this.list(true, req, res, next);
  };

  this.past = (req, res, next) => {
    return this.list(false, req, res, next);
  };
}

module.exports = function(manager) {
  return new Interviews(manager);
};
