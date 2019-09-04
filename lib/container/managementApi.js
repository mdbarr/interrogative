'use strict';

const fs = require('fs');
const os = require('os');
const uuid = require('uuid/v4');
const { join } = require('path');
const restify = require('restify');
const errors = require('restify-errors');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function ManagementAPI (container) {
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

  container.api.use(restify.plugins.bodyParser({
    maxBodySize: container.config.uploads.maxSize,
    maxFileSize: container.config.uploads.maxSize,
    uploadDir: os.tmpdir()
  }));

  //////////

  container.api.use((req, res, next) => {
    res.header('interrogative-version', container.version);
    next();
  });

  //////////

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

  this.authenticate = (req, res, next) => {
    const user = this.lookup(req.params.id);

    if (!user) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    req.authorization = user;
    return next();
  };

  //////////

  this.connections = new Map();

  this.online = () => {
    const users = [];
    for (const [ , user ] of this.connections) {
      users.push(user);
    }
    if (users.length) {
      console.log('online');
      console.pp(users);
      container.events.emit({
        type: 'online',
        data: users
      });
    }
  };

  container.events.on('connected', (event) => {
    this.online();

    container.events.emit({
      type: 'notification:user:joined',
      data: {
        message: `${ event.data.name } joined`,
        level: 'info',
        reference: event.data.user
      }
    });
  });

  //////////

  container.api.get('/ws/:id/main', this.authenticate, (req, res, next) => {
    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const user = req.authorization;
    const upgrade = res.claimUpgrade();
    const shed = container.api.ws.accept(req, upgrade.socket, upgrade.head);

    shed.session = {
      sessionId: uuid(),
      ...user
    };

    this.connections.set(shed.session.sessionId, shed.session);
    console.log('connect', user.name);

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
        container.heartbeat = Date.now();

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
      this.connections.delete(shed.session.sessionId, shed.session);
      console.log('disconnect', user.name);
      container.events.off('*', shed.emitter);
      this.online();
    });

    container.events.emit({
      type: 'register',
      data: shed.session
    });

    return true;
  });

  //////////

  container.api.get('/ws/:id/shell', this.authenticate, container.terminals.shell);

  //////////

  container.api.post('/api/interview/:id/upload', this.authenticate, (req, res, next) => {
    if (req.files && req.files.file && container.interview.uploads) {
      container.heartbeat = Date.now();

      const file = req.files.file;
      const path = container.interview.uploadsPath.replace(/~/, process.env.HOME);
      const filename = join(path, file.name);

      return fs.mkdir(path, { recursive: true }, (error) => {
        if (error) {
          return next(new errors.InternalServerError('Failed to create path'));
        }

        return fs.copyFile(file.path, filename, (error) => {
          if (error) {
            return next(new errors.InternalServerError('Failed to process file'));
          }
          return fs.unlink(file.path, (error) => {
            if (error) {
              return next(new errors.InternalServerError('Failed to clean temporary file'));
            }

            res.send(200, { path: filename });
            return next();
          });
        });
      });
    }
    return next(new errors.BadRequestError('No file specified'));
  });

  //////////

  this.start = (callback) => {
    return container.api.listen(container.config.container.port,
      container.config.container.host, () => {
        const address = container.api.address();
        console.log(`${ container.config.name } Public Container v${ container.version } ` +
                  `listening on http://${ address.address }:${ address.port }`);

        return callback(null);
      });
  };
}

module.exports = function(container) {
  return new ManagementAPI(container);
};
