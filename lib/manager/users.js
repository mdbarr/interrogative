'use strict';

const uuid = require('uuid/v4');
const argon2 = require('argon2');
const crypto = require('crypto');

function Users (manager) {
  this.model = ({
    id, name, email, password, company, title,
    attributes = {}, permissions = {}, metadata = {}
  }, administrator = false) => {
    const model = {
      id: id || uuid(),
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
      model.attributes.administrator = true;
    }

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
}

module.exports = function(manager, options) {
  return new Users(manager, options);
};
