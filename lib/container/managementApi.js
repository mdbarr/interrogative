'use strict';

const restify = require('restify');
const errors = require('restify-errors');
const Terminal = require('./terminal.js');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function ManagementAPI (container) {
  this.lookup = (id) => {
    if (Array.isArray(container.interview.users)) {
      for (const user of container.interview.users) {
        if (user.id === id) {
          return user;
        }
      }
    }
    return null;
  };

  //////////

  container.api = restify.createServer({
    name: container.config.name,
    ignoreTrailingSlash: true,
    strictNext: true,
    handleUpgrades: true
  });

  container.api.ws = new Watershed();

  //////////

  this.cors = corsMiddleware({
    origins: [ '*' ],
    allowHeaders: [ 'Authorization' ],
    exposeHeaders: [ 'Authorization' ]
  });

  container.api.pre(this.cors.preflight);
  container.api.use(this.cors.actual);

  //////////

  container.api.use(restify.pre.sanitizePath());
  container.api.pre(restify.plugins.pre.dedupeSlashes());
  container.api.use(restify.plugins.dateParser());
  container.api.use(restify.plugins.queryParser());
  container.api.use(restify.plugins.bodyParser());
  container.api.use(restify.plugins.authorizationParser());

  //////////

  container.api.use((req, res, next) => {
    res.header('interrogative-version', this.version);
    next();
  });

  //////////

  this.connections = 0;

  container.api.get('/ws/:id/main', (req, res, next) => {
    const user = this.lookup(req.params.id);

    if (!user) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = container.api.ws.accept(req, upgrade.socket, upgrade.head);

    shed.session = user;

    const $send = (event) => {
      console.log('<event', event.type);
      const message = JSON.stringify(event);
      shed.send(message);
    };

    shed.emitter = (event) => {
      if (event.origin !== shed.session.id) {
        $send(event);
      }
    };

    shed.on('text', (data) => {
      if (data !== 'PING') {
        let event;
        try {
          event = JSON.parse(data);

          console.log('>event', event.type, 'origin', event.origin);
          if (event.origin !== container.events.id) {
            container.events.emit(event);
          }
        } catch (error) {
          // ignore
        }
      }
    });

    container.events.on('*', shed.emitter);

    shed.on('end', () => {
      container.events.off('*', shed.emitter);
    });

    container.events.emit({
      type: 'register',
      data: shed.session
    });

    return true;
  });

  //////////

  const terminals = [];

  container.api.get('/ws/:id/shell', (req, res, next) => {
    const user = this.lookup(req.params.id);
    if (!user) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = container.api.ws.accept(req, upgrade.socket, upgrade.head);

    const instance = Number(req.query.instance) || 0;
    const cols = Number(req.query.cols) || 100;
    const rows = Number(req.query.rows) || 24;

    if (!terminals[instance]) {
      terminals[instance] = new Terminal(container, {
        instance,
        cols,
        rows,
        socket: shed
      });
    } else {
      terminals[instance].add(shed);
    }

    return true;
  });

  container.api.post('/api/interview/:id/upload', (req, res, next) => {
    res.send(204);
    return next();
  });

  //////////

  this.start = (callback) => {
    return container.api.listen(container.config.container.port,
      container.config.container.host, () => {
        const address = container.api.address();
        console.log(`${ container.config.name } Public Container v${ this.version } ` +
                  `listening on http://${ address.address }:${ address.port }`);

        return callback(null);
      });
  };
}

module.exports = function(container) {
  return new ManagementAPI(container);
};
