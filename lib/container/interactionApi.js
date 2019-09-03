'use strict';

const restify = require('restify');
const errors = require('restify-errors');
const corsMiddleware = require('restify-cors-middleware');

function InteractionAPI (container) {
  container.interaction = restify.createServer({
    name: container.config.name,
    ignoreTrailingSlash: true,
    strictNext: true
  });

  //////////

  this.cors = corsMiddleware({
    origins: [ '*' ],
    allowHeaders: [ 'Authorization' ],
    exposeHeaders: [ 'Authorization' ]
  });

  container.interaction.pre(this.cors.preflight);
  container.interaction.use(this.cors.actual);

  //////////

  container.interaction.use(restify.pre.sanitizePath());
  container.interaction.pre(restify.plugins.pre.dedupeSlashes());
  container.interaction.use(restify.plugins.dateParser());
  container.interaction.use(restify.plugins.queryParser());
  container.interaction.use(restify.plugins.bodyParser());

  //////////

  container.interaction.use((req, res, next) => {
    res.header('interrogative-version', container.version);
    next();
  });

  //////////

  container.interaction.put('/api/open', (req, res, next) => {
    console.pp(req.body);
    const path = req.body.path;
    if (path && typeof path === 'string' && path.startsWith('/')) {
      container.events.emit({
        type: 'files:file:open',
        data: { path }
      });

      res.send(204);
      return next();
    }
    return next(new errors.BadRequestError(`${ path } not found`));
  });

  //////////

  this.start = (callback) => {
    return container.interaction.listen(container.config.interaction.port,
      container.config.interaction.host, () => {
        const address = container.interaction.address();
        console.log(`${ container.config.name } Container Interaction v${ container.version } ` +
                  `listening on http://${ address.address }:${ address.port }`);

        return callback(null);
      });
  };
}

module.exports = function(container) {
  return new InteractionAPI(container);
};
