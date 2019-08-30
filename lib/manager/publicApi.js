'use strict';

const restify = require('restify');
const errors = require('restify-errors');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function PublicAPI (manager) {
  manager.api = restify.createServer({
    name: manager.config.name,
    ignoreTrailingSlash: true,
    strictNext: true,
    handleUpgrades: true
  });

  manager.api.ws = new Watershed();

  //////////

  this.cors = corsMiddleware({
    origins: [ '*' ],
    allowHeaders: [ 'Authorization' ],
    exposeHeaders: [ 'Authorization' ]
  });

  manager.api.pre(this.cors.preflight);
  manager.api.use(this.cors.actual);

  //////////

  manager.api.use(restify.pre.sanitizePath());
  manager.api.pre(restify.plugins.pre.dedupeSlashes());
  manager.api.use(restify.plugins.dateParser());
  manager.api.use(restify.plugins.queryParser());
  manager.api.use(restify.plugins.authorizationParser());

  //////////

  manager.api.use((req, res, next) => {
    res.header('interrogative-version', manager.version);
    next();
  });

  //////////

  manager.api.get('/ws/:id/main', manager.websocket.attach);
  manager.api.get('/ws/:id/shell', manager.websocket.attach);

  manager.api.get('/api/interview/:id/ready', (req, res, next) => {
    return manager.interviews.ready(req.params.id, (error, interview) => {
      if (error) {
        return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
      }

      res.send(200, interview);
      return next();
    });
  });

  manager.api.post('/api/interview/:id/upload', manager.proxy.pass);

  manager.api.get('/*', restify.plugins.serveStatic({
    directory: '../../dist/',
    default: 'index.html'
  }));

  /////////

  this.start = (callback) => {
    manager.api.listen(manager.config.manager.port, manager.config.manager.host, () => {
      const address = manager.api.address();
      console.log(`${ manager.config.name } Manager API v${ manager.version } ` +
                  `listening on http://${ address.address }:${ address.port }`);

      return callback(null);
    });
  };
}

module.exports = function(manager) {
  return new PublicAPI(manager);
};
