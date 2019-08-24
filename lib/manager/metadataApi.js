'use strict';

const restify = require('restify');

function MetadataAPI(manager) {
  manager.metadata = restify.createServer({
    name: manager.config.name,
    ignoreTrailingSlash: true,
    strictNext: true
  });

  manager.metadata.use(restify.pre.sanitizePath());
  manager.metadata.pre(restify.plugins.pre.dedupeSlashes());
  manager.metadata.use(restify.plugins.queryParser());
  manager.metadata.use(restify.plugins.bodyParser());

  //////////

  manager.metadata.get('/interview/:id', (req, res, next) => {
    if (manager.interviews.store.has(req.params.id)) {
      res.send(200, manager.interviews.store.get(req.params.id));
      return next();
    }
    res.send(404, { message: `${ req.params.id } not found` });
    return next();
  });

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
