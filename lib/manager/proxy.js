'use strict';

const axios = require('axios');
const errors = require('restify-errors');

function Proxy (manager) {
  this.forward = (req, res, next) => {
    const interview = manager.interviews.lookup(req.params.id);
    if (!interview) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    const url = `http://${ interview.state.container.address }:` +
          `${ manager.config.container.port }${ req.path() }`;

    const options = {
      method: req.method.toLowerCase(),
      url
    };

    if (req.body) {
      options.data = req.body;
    }

    console.log('[proxy]', url);

    return axios(options).
      then((response) => {
        console.log('[proxy]', req.url, response.status);
        res.send(response.status, response.data);
        return next();
      }).
      catch((error) => {
        console.log('[proxy]', error.message);
        if (error.response) {
          console.log('[proxy]', req.url, error.response.status);
          res.send(error.response.status, error.response.data);
          return next();
        }
        return next(new errors.InternalServerError(error.message));
      });
  };
}

module.exports = function (manager) {
  return new Proxy(manager);
};
