'use strict';

const request = require('request');
const errors = require('restify-errors');

function Proxy (manager) {
  this.pass = (req, res, next) => {
    return manager.interviews.lookup(req.params.id, (error, interview) => {
      if (!interview) {
        return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
      }

      const url = `http://${ interview.state.container.address }:` +
            `${ manager.config.container.port }${ req.path() }`;

      console.log('[proxy-pass]', url);

      error = null;
      const proxy = request(url);

      proxy.on('error', (err) => {
        console.log('[proxy-pass] error', error);
        error = err;
      });

      proxy.on('end', () => {
        console.log('[proxy-pass] done');
        return next(error);
      });

      return req.pipe(proxy).pipe(res);
    });
  };
}

module.exports = function (manager) {
  return new Proxy(manager);
};
