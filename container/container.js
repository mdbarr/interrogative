#!/usr/bin/env node
'use strict';

require('barrkeep/pp');
const uuid = require('uuid/v4');
const restify = require('restify');
const events = require('@mdbarr/events');
const Terminal = require('./terminal.js');
const { merge } = require('barrkeep/utils');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function Container (options = {}) {
  this.version = require('../package').version;
  this.config = merge(require('../defaults'), options, true);

  //////////

  this.events = new events.EventBus();

  //////////

  this.files = require('./files')(this, this.config.container.home);

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

  this.api.get('/ws/attach/main', (req, res, next) => {
    if (!res.claimUpgrade) {
      next(new Error('Connection Must Upgrade For WebSockets'));
      return;
    }

    const upgrade = res.claimUpgrade();
    const shed = this.api.ws.accept(req, upgrade.socket, upgrade.head);

    shed.session = {
      id: uuid(),
      role: 'admin',
      user: 'Admin'
    };

    const $send = (event) => {
      console.log('<event', event.type);
      const message = JSON.stringify(event);
      shed.send(message);
    };

    shed.emitter = (event) => {
      if (event.origin === this.events.id) {
        $send(event);
      }
    };

    shed.on('text', (data) => {
      if (data !== 'PING') {
        let event;
        try {
          event = JSON.parse(data);

          console.log('>event', event.type);
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

    this.events.emit({
      type: 'files:tree:update',
      data: this.files.tree
    });
  });

  //////////

  const terminals = [];

  this.api.get('/ws/attach/shell', (req, res, next) => {
    if (!res.claimUpgrade) {
      next(new Error('Connection Must Upgrade For WebSockets'));
      return;
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
  });

  //////////

  this.start = (callback) => {
    this.files.start();

    this.api.listen(this.config.container.port, this.config.container.host, () => {
      const address = this.api.address();
      console.log(`${ this.config.name } v${ this.version } listening on http://${ address.address }:${ address.port }`);
      if (callback) {
        return callback(null);
      }
      return true;
    });
  };
}

const container = new Container();
container.start();
