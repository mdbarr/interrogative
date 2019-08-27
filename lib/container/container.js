#!/usr/bin/env node
'use strict';

require('barrkeep/pp');
const request = require('request');
const restify = require('restify');
const utils = require('barrkeep/utils');
const errors = require('restify-errors');
const events = require('@mdbarr/events');
const Terminal = require('./terminal.js');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function Container (options = {}) {
  this.version = require('../../package').version;
  this.config = utils.merge(require('../../defaults'), options, true);

  //////////

  this.interview = {
    id: process.env.INTERVIEW_ID,
    manager: process.env.MANAGER_IP
  };

  this.lookup = (id) => {
    if (Array.isArray(this.interview.users)) {
      for (const user of this.interview.users) {
        if (user.id === id) {
          return user;
        }
      }
    }
    return null;
  };

  //////////

  this.events = new events.EventBus();

  //////////

  this.files = require('./files')(this);
  this.git = require('./git')(this);

  //////////

  this.api = restify.createServer({
    name: this.config.name,
    ignoreTrailingSlash: true,
    strictNext: true,
    handleUpgrades: true
  });

  this.api.ws = new Watershed();

  //////////

  this.cors = corsMiddleware({
    origins: [ '*' ],
    allowHeaders: [ 'Authorization' ],
    exposeHeaders: [ 'Authorization' ]
  });

  this.api.pre(this.cors.preflight);
  this.api.use(this.cors.actual);

  //////////

  this.api.use(restify.pre.sanitizePath());
  this.api.pre(restify.plugins.pre.dedupeSlashes());
  this.api.use(restify.plugins.dateParser());
  this.api.use(restify.plugins.queryParser());
  this.api.use(restify.plugins.bodyParser());
  this.api.use(restify.plugins.authorizationParser());

  //////////

  this.api.use((req, res, next) => {
    res.header('interrogative-version', this.version);
    next();
  });

  //////////

  this.connections = 0;

  this.api.get('/ws/:id/main', (req, res, next) => {
    const user = this.lookup(req.params.id);

    if (!user) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = this.api.ws.accept(req, upgrade.socket, upgrade.head);

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
          if (event.origin !== this.events.id) {
            this.events.emit(event);
          }
        } catch (error) {
          // ignore
        }
      }
    });

    this.events.on('*', shed.emitter);

    shed.on('end', () => {
      this.events.off('*', shed.emitter);
    });

    this.events.emit({
      type: 'register',
      data: shed.session
    });

    return true;
  });

  //////////

  const terminals = [];

  this.api.get('/ws/:id/shell', (req, res, next) => {
    const user = this.lookup(req.params.id);
    if (!user) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = this.api.ws.accept(req, upgrade.socket, upgrade.head);

    const instance = Number(req.query.instance) || 0;
    const cols = Number(req.query.cols) || 100;
    const rows = Number(req.query.rows) || 24;

    if (!terminals[instance]) {
      terminals[instance] = new Terminal(this, {
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

  //////////

  this.identity = (callback) => {
    request.get({
      url: `http://${ this.interview.manager }:${ this.config.metadata.port }` +
        `/api/interview/${ this.interview.id }`,
      json: true
    }, (error, res, body) => {
      if (error) {
        return callback(error);
      }
      console.pp(body);
      Object.assign(this.interview, body);

      return callback(null, this.interview);
    });
  };

  this.ready = (callback) => {
    request.put({
      url: `http://${ this.interview.manager }:${ this.config.metadata.port }` +
        `/api/interview/${ this.interview.id }/ready`,
      json: true,
      body: { ready: true }
    }, (error) => {
      if (error) {
        return callback(error);
      }

      return callback(null);
    });
  };

  this.start = (callback) => {
    callback = utils.callback(callback);

    this.identity((error) => {
      if (error) {
        return callback(error);
      }
      console.log('Container Identity:');
      console.pp(this.interview);

      this.files.start();
      this.git.start();

      return this.api.listen(this.config.container.port, this.config.container.host, () => {
        const address = this.api.address();
        console.log(`${ this.config.name } Container v${ this.version } ` +
                    `listening on http://${ address.address }:${ address.port }`);

        this.ready((error) => {
          return callback(error);
        });
      });
    });
  };
}

const container = new Container();
container.start((error) => {
  if (error) {
    console.log('error', error);
  }
});
