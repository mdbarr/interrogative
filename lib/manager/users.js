'use strict';

const uuid = require('uuid/v4');
const argon2 = require('argon2');
const crypto = require('crypto');

function Users (manager) {
  //////////

  this.model = ({
    id, name, email, password, company, title,
    attributes = {}, permissions = {}, metadata = {}
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
      metadata
    };

    if (administrator) {
      model.administrator = true;
    }

    manager.utils.hidden(model, 'save', (callback) => {
      return manager.database.users.updateOne({ id: model.id },
        { $set: model },
        { upsert: true },
        callback);
    });

    manager.utils.hidden(model, 'update', () => {
      manager.queue.push({
        name: 'user update',
        task: model.save
      });
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

  this.validatePassword = function(input, hash, callback) {
    callback = manager.util.callback(callback, true);

    if (!input || !hash) {
      return callback(null, false);
    }

    if (!hash.startsWith('$argon2')) {
      return callback(null, false);
    }

    return argon2.verify(hash, input).
      then((verified) => {
        return callback(null, verified);
      }).
      catch((error) => {
        return callback(error);
      });
  };

  //////////

  this.lookup = (id, callback) => {
    if (manager.cache.has(id)) {
      return setImmediate(() => {
        return callback(null, manager.cache.get(id));
      });
    }

    let filter = { id };
    if (id.includes('@')) {
      filter = { email: id };
    }

    return manager.database.users.findOne(filter, (error, item) => {
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

  this.load = (callback) => {
    return manager.database.users.findOne({ administrator: true }, (error, admin) => {
      if (error || !admin) {
        const password = crypto.randomBytes(32).toString('hex');
        return this.hashPassword(password, (error, hash) => {
          if (error) {
            return callback(error);
          }
          this.administrator = this.model({
            name: 'administrator',
            email: 'administrator',
            password: hash,
            company: 'Interrogative',
            title: 'Administrator'
          }, true);

          return this.administrator.save((error) => {
            if (!error) {
              console.log('[manager] bootstrapping initial admin account:');
              console.log('[manager]   username: administrator');
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
}

module.exports = function(manager, options) {
  return new Users(manager, options);
};
