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
    const path = req.path() || '';
    if (path.includes('upload') || path.includes('search')) {
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
  manager.api.get('/ws/:id/terminal', manager.websocket.attach);

  manager.api.get('/api/interview/:id/ready', (req, res, next) => {
    return manager.interviews.ready(req.params.id, (error, interview) => {
      if (error) {
        console.log('ready error', error);
        if (error instanceof Error) {
          return next(error);
        } else if (typeof error === 'string') {
          if (error.includes('found')) {
            return next(new errors.NotFoundError(`Interview ${ req.params.id } not found!`));
          } else if (error.includes('available')) {
            return next(new errors.ConflictError(error));
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

  manager.api.post('/api/interviews/create',
    manager.sessions.validate,
    manager.interviews.create);

  manager.api.post('/api/interviews/:id',
    manager.sessions.validate,
    manager.interviews.update);

  manager.api.get('/api/interviews/upcoming',
    manager.sessions.validate,
    manager.interviews.upcoming);

  manager.api.get('/api/interviews/past',
    manager.sessions.validate,
    manager.interviews.past);

  //////////

  manager.api.get('/api/users/available', manager.users.available);
  manager.api.post('/api/users/signup', manager.users.signup);
  manager.api.get('/api/users/:id/activate', manager.users.activate, manager.sessions.current);
  manager.api.post('/api/users/forgot', manager.users.forgot);
  manager.api.post('/api/users/:id/reset', manager.users.reset, manager.sessions.current);

  //////////

  manager.api.post('/api/session',
    manager.sessions.login,
    manager.sessions.current);

  manager.api.get('/api/session',
    manager.sessions.validate,
    manager.sessions.current);

  manager.api.del('/api/session',
    manager.sessions.validate,
    manager.sessions.logout);

  //////////

  manager.api.get('/favicon.ico', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/'),
    file: 'favicon.ico'
  }));

  manager.api.get('/logo.png', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/'),
    file: 'logo.png'
  }));

  manager.api.get('/*', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/'),
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

  manager.api.get('/img/*', restify.plugins.serveStatic({
    directory: join(__dirname, '../../dist/img'),
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
