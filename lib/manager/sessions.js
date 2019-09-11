'use strict';

const uuid = require('uuid/v4');
const errors = require('restify-errors');

function Sessions (manager) {
  this.model = ({
    id, created, timestamp, user
  }) => {
    const now = Date.now();
    const model = {
      id: id || uuid(),
      object: 'session',
      created: created || now,
      timestamp: timestamp || now,
      user
    };

    manager.cache.save(model);

    return model;
  };

  this.create = (user) => {
    return this.model({ user: user.id });
  };

  //////////

  this.login = (req, res, next) => {
    if (!req.body || !req.body.username || !req.body.password) {
      res.clearCookie(manager.config.api.cookie);
      return next(new errors.UnauthorizedError('Invalid username or password'));
    }

    const username = req.body.username || '';
    const password = req.body.password || '';

    return manager.users.lookup(username, (error, user) => {
      if (error || !user) {
        res.clearCookie(manager.config.api.cookie);
        return next(new errors.UnauthorizedError('Invalid username or password'));
      }

      return manager.users.validatePassword(password, user.password, (error, validated) => {
        if (!validated) {
          res.clearCookie(manager.config.session.cookie);
          return next(new errors.UnauthorizedError('Invalid username or password'));
        }

        req.authorization = {
          user,
          session: this.create(user)
        };

        return next();
      });
    });
  };

  this.current = (req, res, next) => {
    if (!req.authorization || !req.authorization.sesssion) {
      return next(new errors.UnauthorizedError('Invalid session'));
    }
    res.send(200, req.authorization.session);
    return next();
  };

  this.logout = (req, res, next) => {
    manager.cache.delete(req.authorization.session.id);
    res.clearCookie(manager.config.api.cookie);
    res.send(204);
    next();
  };

  this.validate = (req, res, next) => {
    let id = null;
    let type = 'none';
    if (req.headers && req.headers.authorization) {
      type = 'bearer';
      id = req.headers.authorization.toLowerCase().replace('bearer ', '');
    } else if (req.cookies && req.cookies[manager.config.api.cookie]) {
      type = 'cookie';
      id = req.cookies[manager.config.api.cookie];
    } else if (req.query && req.query.id) {
      type = 'query';
      id = req.query.id;
    } else if (req.params && req.params.id) {
      type = 'param';
      id = req.params.id;
    }

    if (!id) {
      res.clearCookie(manager.config.session.cookie);
      return next(new errors.UnauthorizedError(`Invalid session ${ id }`));
    }

    const session = manager.cache.get(id);
    if (!session) {
      res.clearCookie(manager.config.api.cookie);
      return next(new errors.UnauthorizedError(`Invalid session ${ id }`));
    }

    session.timestamp = Date.now();

    return manager.users.lookup(session.user, (error, user) => {
      if (error || !user) {
        return next(new errors.UnauthorizedError(`Invalid session ${ id }`));
      }

      req.authorization.user = user;
      req.authorization.session = session;
      req.authorization.type = type;

      return next();
    });
  };

  this.administrator = (req, res, next) => {
    return this.validate(req, res, (error) => {
      if (error) {
        return next(error);
      }

      if (!req.authorization.user.administrator === true) {
        return next(new errors.UnauthorizedError('Administrator credentials required'));
      }

      return next();
    });
  };
}

module.exports = function (manager) {
  return new Sessions(manager);
};
