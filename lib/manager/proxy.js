'use strict';

const request = require('request');
const errors = require('restify-errors');

function Proxy (manager) {
  this.pass = (req, res, next) => {
    const interview = manager.interviews.lookup(req.params.id);
    if (!interview) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    const url = `http://${ interview.state.container.address }:` +
          `${ manager.config.container.port }${ req.path() }`;

    console.log('[proxy-pass]', url);

    const proxy = request(url);

    let error = null;

    proxy.on('error', (err) => {
      console.log('[proxy-pass] error', error);
      error = err;
    });

    proxy.on('end', () => {
      console.log('[proxy-pass] done');
      return next(error);
    });

    return req.pipe(proxy).pipe(res);
  };
}

module.exports = function (manager) {
  return new Proxy(manager);
};
