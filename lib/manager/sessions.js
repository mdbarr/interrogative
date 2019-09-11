'use strict';

const uuid = require('uuid/v4');
const errors = require('restify-errors');

function Sessions (manager) {
  this.create = (user) => {
    const now = Date.now();
    const model = {
      id: uuid(),
      object: 'session',
      created: now,
      timestamp: now,
      user: user.id
    };

    manager.cache.add(model);

    return model;
  };

  //////////

  this.login = (req, res, next) => {
    if (!req.body || !req.body.username || !req.body.password) {
      res.clearCookie(manager.config.sessions.cookie);
      return next(new errors.BadRequestError('You must specify both a username and password'));
    }

    const username = req.body.username || '';
    const password = req.body.password || '';

    return manager.users.lookup(username, (error, user) => {
      if (error || !user) {
        res.clearCookie(manager.config.sessions.cookie);
        return next(new errors.UnauthorizedError('Invalid username or password'));
      }

      return manager.users.validatePassword(user, password, (error, validated) => {
        if (error || !validated) {
          res.clearCookie(manager.config.sessions.cookie);
          return next(new errors.UnauthorizedError('Invalid username or password'));
        }

        req.authorization = {
          session: this.create(user),
          user
        };

        return next();
      });
    });
  };

  this.sanitize = (object) => {
    const data = Object.assign({}, object);
    for (const property of this.sanitize.properties) {
      delete data[property];
    }
    return data;
  };
  this.sanitize.properties = [ 'password', 'mfa' ];

  this.current = (req, res, next) => {
    if (!req.authorization || !req.authorization.session) {
      return next(new errors.UnauthorizedError('Invalid session'));
    }

    const current = {
      ...req.authorization.session,
      user: this.sanitize(req.authorization.user)
    };

    res.setCookie(manager.config.sessions.cookie, current.id);
    res.send(200, current);
    return next();
  };

  this.logout = (req, res, next) => {
    manager.cache.delete(req.authorization.session.id);
    res.clearCookie(manager.config.sessions.cookie);
    res.send(204);
    next();
  };

  this.validate = (req, res, next) => {
    let id = null;
    let type = 'none';
    if (req.headers && req.headers.authorization) {
      type = 'bearer';
      id = req.headers.authorization.toLowerCase().replace('bearer ', '');
    } else if (req.cookies && req.cookies[manager.config.sessions.cookie]) {
      type = 'cookie';
      id = req.cookies[manager.config.sessions.cookie];
    } else if (req.query && req.query.id) {
      type = 'query';
      id = req.query.id;
    } else if (req.params && req.params.id) {
      type = 'param';
      id = req.params.id;
    }

    console.log('[session]', id, type);

    if (!id) {
      res.clearCookie(manager.config.sessions.cookie);
      return next(new errors.UnauthorizedError(`Invalid session ${ id }`));
    }

    const session = manager.cache.get(id);
    if (!session) {
      res.clearCookie(manager.config.sessions.cookie);
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
