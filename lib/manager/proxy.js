'use strict';

const request = require('request');
const errors = require('restify-errors');

function Proxy (manager) {
  this.forward = (req, res, next) => {
    const interview = manager.interviews.lookup(req.params.id);
    if (!interview) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    const url = `http://${ interview.state.container.address }:` +
          `${ manager.config.container.port }${ req.path() }`;

    console.log('[proxy]', url);

    return req.pipe(request(url)).pipe(res);
  };
}

module.exports = function (manager) {
  return new Proxy(manager);
};
