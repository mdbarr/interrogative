'use strict';

const restify = require('restify');
const errors = require('restify-errors');

function MetadataAPI (manager) {
  manager.metadata = restify.createServer({
    name: manager.config.name,
    ignoreTrailingSlash: true,
    strictNext: true,
  });

  manager.metadata.use(restify.pre.sanitizePath());
  manager.metadata.pre(restify.plugins.pre.dedupeSlashes());
  manager.metadata.use(restify.plugins.queryParser());
  manager.metadata.use(restify.plugins.bodyParser());

  //////////

  manager.metadata.get('/api/interview/:id', (req, res, next) => manager.interviews.lookup(req.params.id, (error, interview) => {
    if (error || !interview) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    const address = req.connection.remoteAddress;

    if (address === interview.state.container.address) {
      res.send(200, interview);
      return next();
    }
    return next(new errors.UnauthorizedError(`Not authorized to access ${ req.params.id }`));
  }));

  manager.metadata.put('/api/interview/:id/ready', (req, res, next) => manager.interviews.lookup(req.params.id, (error, interview) => {
    if (error || !interview) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    const address = req.connection.remoteAddress;

    if (address === interview.state.container.address) {
      interview.state.container.ready = Boolean(req.body.ready);

      if (interview.state.container.ready) {
        interview.state.container.starting = false;
      }

      res.send(200, interview);
      return next();
    }
    return next(new errors.UnauthorizedError(`Not authorized to access ${ req.params.id }`));
  }));

  //////////

  this.start = (callback) => {
    manager.metadata.listen(manager.config.metadata.port, manager.config.metadata.host, () => {
      const address = manager.metadata.address();
      console.log(`${ manager.config.name } Manager Metadata v${ manager.version } ` +
                  `listening on http://${ address.address }:${ address.port }`);

      return callback(null);
    });
  };
}

module.exports = function(manager) {
  return new MetadataAPI(manager);
};
