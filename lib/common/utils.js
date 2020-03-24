'use strict';

const version = require('../../package').version;

module.exports = {
  ...require('barrkeep/utils'),
  hidden: (object, property, value) => {
    Object.defineProperty(object, property, {
      enumerable: false,
      value,
    });
  },
  interrogative: (req, res, next) => {
    res.header('interrogative-version', version);

    const ip = req.headers['x-real-ip'] ||
          req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress;
    req.realIP = ip;

    next();
  },
};
