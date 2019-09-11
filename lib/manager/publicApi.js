'use strict';

const { join } = require('path');
const restify = require('restify');
const errors = require('restify-errors');
const cookieParser = require('restify-cookies');
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
  manager.api.use(cookieParser.parse);

  // selective body parse
  manager.api.use((req, res, next) => {
    if (req.path().includes('upload')) {
      req._readBody = true;
      req._parsedBody = true;
    }
    return next();
  });

  manager.api.use(restify.plugins.bodyParser());

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
        console.log('ready error', error);
        if (error instanceof Error) {
          return next(error);
        } else if (typeof error === 'string') {
          if (error.includes('found')) {
            return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
          } else if (error.includes('available')) {
            return next(new errors.ConflictError(`Interview ${ req.params.id } not available`));
          }
          return next(new errors.BadRequestError('Bad request'));
        }
      }
      res.send(200, interview);
      return next();
    });
  });

  manager.api.post('/api/interview/:id/upload', manager.proxy.pass);
  manager.api.post('/api/interview/:id/search', manager.proxy.pass);

  //////////

  manager.api.post('/api/session', manager.sessions.login, manager.sessions.current);
  manager.api.get('/api/session', manager.sessions.validate, manager.sessions.current);
  manager.api.del('/api/session', manager.sessions.validate, manager.sessions.logout);

  //////////

  manager.api.get('/*', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/'),
    default: 'index.html',
    file: 'index.html'
  }));

  manager.api.get('/css/*', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/css'),
    appendRequestPath: false
  }));

  manager.api.get('/fonts/*', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/fonts'),
    appendRequestPath: false
  }));

  manager.api.get('/js/*', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/js'),
    appendRequestPath: false
  }));

  manager.api.get('/interview/*', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/'),
    default: 'index.html',
    file: 'index.html'
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
