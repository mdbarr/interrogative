'use strict';

const uuid = require('uuid/v4');
const moment = require('moment');
const errors = require('restify-errors');
const { milliseconds } = require('barrkeep/utils');

function Interviews (manager) {
  this.models = {};

  //////////

  this.actions = {
    scopes: {
      tab: 'Current Editor Tab',
      global: 'Global'
    },
    filters: {
      ext: 'File Extension',
      name: 'File Name',
      type: 'File Type'
    },
    types: {
      interactive: 'Interactive mode',
      simple: 'Results only'
    }
  };

  this.models.action = (interview, {
    type = 'simple', scope = 'tab', filter = 'ext', match,
    icon = 'play-circle-outline', name, hint,
    action = 'exec', command
  }) => {
    const model = {
      type,
      scope,
      filter,
      match,
      icon,
      name,
      hint,
      action,
      command
    };

    interview.actions.push(model);

    return model;
  };

  //////////

  this.models.user = (interview, {
    id, name, email, role
  }, sendEmails = true) => {
    const invitation = interview.start - milliseconds(interview.invitation);
    const reminder = interview.start - milliseconds(interview.reminder);

    const model = {
      id: id || uuid(),
      name,
      email,
      role,
      invitation: {
        scheduled: invitation,
        sent: !sendEmails
      },
      reminder: {
        scheduled: reminder,
        sent: !sendEmails
      }
    };

    if (!interview.ids.includes(model.id)) {
      interview.ids.push(model.id);
    }

    interview.users.push(model);

    return model;
  };

  //////////

  this.models.interview = ({
    id, ids, owner, image = 'interrogative-container:latest', volume,
    start, stop, duration,
    title, company, position, notes, users,
    home = '/home/user', open = [ 'WELCOME.md' ],
    git, repository, uploads, uploadsPath,
    actions, keypairs,
    state, email = true, ephemeral = false
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
      users: [ ],
      invitiation: '1d',
      reminder: '8h',
      home,
      open,
      git: git !== undefined ? git : true,
      repository: repository || home,
      uploads: uploads !== undefined ? uploads : true,
      uploadsPath: uploadsPath || manager.config.uploads.path,
      actions: [ ],
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
      this.models.user(model, user, email);
    }

    for (const action of actions) {
      this.models.action(model, action);
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
    const example = this.models.interview({
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
      } ],
      email: false,
      actions: [ {
        name: 'Run',
        hint: 'Run the current script',
        command: 'run',
        match: 'js pl py rb sh'
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
        const model = this.models.interview(item);
        return callback(null, model);
      }
      return callback(`${ id } not found`);
    });
  };

  this.available = (id, interview) => {
    for (const user of interview.users) {
      if (user.id === id) {
        if (user.role === 'candidate') {
          const now = Date.now();
          if (now >= interview.start && now <= interview.stop) {
            return true;
          } else if (now > interview.stop) {
            return 'This interview is no longer available.';
          } if (now >= interview.start - milliseconds('10m')) {
            const start = moment(interview.start).calendar();
            return 'This interview isn\'t available yet.<br>' +
              `Please check back closer to the start time of ${ start }.`;
          }
          return 'This interview isn\'t available yet.<br>' +
            'Please check back closer to the scheduled time.';
        }
        return true;
      }
    }
    return 'This interview isn\'t available yet.';
  };

  this.ready = (id, callback) => {
    this.lookup(id, (error, model) => {
      if (error) {
        return callback(error);
      }

      const availability = this.available(id, model);
      if (availability !== true) {
        return callback(availability);
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

    const model = this.models.interview(req.body);

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
      $or: [
        { owner: req.authorization.user.id },
        { 'user.email': req.authorization.user.email }
      ],
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
