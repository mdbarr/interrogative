'use strict';

const uuid = require('uuid/v4');
const argon2 = require('argon2');
const crypto = require('crypto');
const errors = require('restify-errors');

const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function Users (manager) {
  this.model = ({
    id, name, email, password, company, title,
    attributes = {}, permissions = {}, metadata = {},
    verified, deleted
  }, administrator = false) => {
    const model = {
      id: id || uuid(),
      object: 'user',
      name,
      email,
      password,
      company,
      title,
      attributes,
      permissions,
      metadata,
      verified: verified === true,
      deleted: deleted === true
    };

    if (administrator) {
      model.administrator = true;
    }

    manager.utils.hidden(model, '$password', (callback) => {
      if (model.password.startsWith('$argon2')) {
        return setImmediate(() => { callback(null); });
      }
      return this.hashPassword(model.password, (error, hash) => {
        if (error) {
          return callback(error);
        }
        model.password = hash;

        return callback(null, model);
      });
    });

    manager.utils.hidden(model, '$save', (callback) => {
      return model.$password(() => {
        return manager.database.users.updateOne({ id: model.id },
          { $set: model },
          { upsert: true },
          callback);
      });
    });

    manager.utils.hidden(model, '$signup', (callback) => {
      const signup = {
        id: uuid(),
        object: 'signup',
        user: model.id,
        name: model.name,
        email: model.email
      };

      model.attributes.signup = {
        id: signup.id,
        expires: Date.now() + manager.utils.milliseconds('7d')
      };

      return manager.database.messages.updateOne({ id: signup.id },
        { $set: signup },
        { upsert: true },
        () => { model.$save(callback); });
    });

    manager.utils.hidden(model, '$reset', (callback) => {
      const reset = {
        id: uuid(),
        object: 'reset',
        user: model.id,
        name: model.name,
        email: model.email
      };

      model.attributes.reset = {
        id: reset.id,
        expires: Date.now() + manager.utils.milliseconds('7d')
      };

      return manager.database.messages.updateOne({ id: reset.id },
        { $set: reset },
        { upsert: true },
        () => { model.$save(callback); });
    });

    manager.utils.hidden(model, '$activate', (callback) => {
      if (model.verified) {
        return setImmediate(() => { callback(null, model); });
      }

      model.verified = true;
      model.attributes.signup = Date.now();

      return model.$save(callback);
    });

    manager.cache.add(model);

    return model;
  };

  //////////

  this.md5 = (data) => {
    data = data.toString().
      toLowerCase().
      trim();

    return crypto.createHash('md5').
      update(data).
      digest('hex');
  };

  this.hashPassword = function(password, callback) {
    if (!password) {
      return callback(null, false);
    }
    return argon2.hash(password).
      then((hash) => {
        return callback(null, hash);
      }).
      catch((error) => {
        return callback(error);
      });
  };

  this.validatePassword = function(user, input, callback) {
    if (!input || !user || !user.password || !user.password.startsWith('$argon2')) {
      return setImmediate(() => {
        callback(null, false);
      });
    }

    return argon2.verify(user.password, input).
      then((verified) => {
        return callback(null, verified);
      }).
      catch((error) => {
        return callback(error);
      });
  };

  //////////

  this.filter = (value) => {
    if (typeof value === 'object') {
      return value;
    } else if (typeof value === 'string') {
      if (uuidRegExp.test(value)) {
        return { id: value };
      }
      return { email: value };
    }
    return { _id: null }; // no-op
  };

  this.lookup = (id, callback) => {
    if (typeof id === 'string') {
      id = id.toLowerCase().trim();
    }

    if (manager.cache.has(id)) {
      return setImmediate(() => {
        return callback(null, manager.cache.get(id));
      });
    }

    return manager.database.users.findOne(this.filter(id), (error, item) => {
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

  this.email = (email, callback) => {
    return manager.database.users.find({ email }).count((error, count) => {
      if (error) {
        return callback(error);
      } else if (count) {
        return callback(null, false);
      }

      return callback(null, true);
    });
  };

  this.load = (callback) => {
    return manager.database.users.findOne({ administrator: true }, (error, admin) => {
      if (error || !admin) {
        const password = crypto.randomBytes(32).toString('hex');
        return this.hashPassword(password, (error, hash) => {
          if (error) {
            return callback(error);
          }
          this.administrator = this.model({
            name: 'Administrator',
            email: 'administrator@interrogative.io',
            password: hash,
            company: 'Interrogative',
            title: 'Administrator',
            verified: true
          }, true);

          return this.administrator.$save((error) => {
            if (!error) {
              console.log('[manager] bootstrapping initial admin account:');
              console.log(`[manager]   username: ${ this.administrator.email }`);
              console.log(`[manager]   password: ${ password }`);
            }
            return callback(error);
          });
        });
      }

      this.administrator = admin;

      return callback(null);
    });
  };

  //////////

  this.available = (req, res, next) => {
    this.email(req.query.email, (error, free) => {
      if (error) {
        return next(new errors.InternalServerError(error));
      }

      const response = {
        email: req.query.email,
        free
      };

      res.send(200, response);
      return next();
    });
  };

  this.signup = (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return next(new errors.BadRequestError('Missing signup details'));
    }

    const user = this.model({
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase().trim(),
      company: (req.body.company || '').trim(),
      title: (req.body.title || '').trim(),
      password: req.body.password,
      attributes: { created: Date.now() },
      verified: false
    });

    return user.$signup(() => {
      res.send(204);
      return next();
    });
  };

  this.activate = (req, res, next) => {
    return this.lookup({ 'attributes.signup.id': req.params.id }, (error, user) => {
      if (error || !user) {
        return next(new errors.BadRequestError('Bad account activation'));
      }

      if (Date.now() > user.attributes.signup.expires) {
        return next(new errors.BadRequestError('Activation has expired'));
      }

      return user.$activate(() => {
        req.authorization = {
          session: manager.sessions.create(user),
          user
        };

        return next();
      });
    });
  };

  this.forgot = (req, res, next) => {
    return this.lookup(req.body.email, (error, user) => {
      if (error || !user) {
        return next(new errors.BadRequestError('Email address not found'));
      }

      return user.$reset(() => {
        res.send(204);
        return next();
      });
    });
  };

  this.reset = (req, res, next) => {
    return this.lookup({ 'attributes.reset.id': req.params.id }, (error, user) => {
      if (error || !user || !req.body.password) {
        return next(new errors.BadRequestError('Bad password reset'));
      }

      return this.hashPassword(req.body.password, (error, hash) => {
        if (error) {
          return next(new errors.BadRequestError('Bad password reset'));
        }

        user.password = hash;
        user.verified = true;
        user.attributes.reset = Date.now();

        return user.$save(() => {
          req.authorization = {
            session: manager.sessions.create(user),
            user
          };
          return next();
        });
      });
    });
  };
}

module.exports = function(manager, options) {
  return new Users(manager, options);
};
