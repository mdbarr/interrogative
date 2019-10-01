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

    if (!model.verified) {
      model.registration = {
        id: uuid(),
        expires: Date.now() + manager.utils.milliseconds('7d')
      };
    }

    manager.utils.hidden(model, 'save', (callback) => {
      return manager.database.users.updateOne({ id: model.id },
        { $set: model },
        { upsert: true },
        callback);
    });

    manager.utils.hidden(model, 'activate', (callback) => {
      if (model.verified) {
        return setImmediate(() => { callback(null, model); });
      }

      model.verified = true;
      model.attributes.verified = Date.now();

      return model.save(callback);
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

          return this.administrator.save((error) => {
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

  this.register = (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return next(new errors.BadRequestError('Missing registration details'));
    }

    const user = this.model({
      name: req.body.name,
      email: req.body.email,
      company: req.body.company || '',
      title: req.body.title || '',
      password: req.body.password,
      attributes: { created: Date.now() },
      verified: false
    });

    return user.save(() => {
      res.send(204);
      return next();
    });
  };

  this.activate = (req, res, next) => {
    return this.lookup(req.params.id, (error, user) => {
      if (error || !user) {
        return next(new errors.BadRequestError('Bad account activation'));
      }

      return user.activate(() => {
        res.send(200, user);
        return next();
      });
    });
  };

  this.forgot = (req, res, next) => {
    return this.lookup(req.query.email, (error, user) => {
      if (error || !user || !req.body.password) {
        return next(new errors.BadRequestError('Bad password reset'));
      }

      user.password = '*';
      user.attributes.reset = uuid();

      return user.save(() => {
        res.send(204);
        return next();
      });
    });
  };

  this.reset = (req, res, next) => {
    return this.lookup({ 'attributes.reset': req.params.id }, (error, user) => {
      if (error || !user || !req.body.password) {
        return next(new errors.BadRequestError('Bad password reset'));
      }

      return this.hashPassword(req.body.password, (error, hash) => {
        if (error) {
          return next(new errors.BadRequestError('Bad password reset'));
        }
        user.password = hash;
        user.attributes.reset = Date.now();

        return user.save(() => {
          res.send(204);
          return next();
        });
      });
    });
  };
}

module.exports = function(manager, options) {
  return new Users(manager, options);
};
