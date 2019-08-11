#!/usr/bin/env node
'use strict';

require('barrkeep/pp');
const pty = require('node-pty');
const restify = require('restify');
const { merge } = require('barrkeep/utils');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function Container (options = {}) {
  this.version = require('../package').version;
  this.config = merge(require('../defaults'), options, true);

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

  this.api.get('/ws/attach/shell', (req, res, next) => {
    if (!res.claimUpgrade) {
      next(new Error('Connection Must Upgrade For WebSockets'));
      return;
    }

    const upgrade = res.claimUpgrade();
    const shed = this.api.ws.accept(req, upgrade.socket, upgrade.head);

    const shell = pty.spawn('/bin/bash', [ ], {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: {
        HOME: process.env.HOME,
        USER: process.env.USER,
        LANG: process.env.LANG,
        PATH: process.env.PATH,

        INTERROGATIVE: '1'
      },
      cols: Number(req.query.cols) || 100,
      rows: Number(req.query.rows) || 24
    });

    // Outgoing from shell to websocket

    shell.on('data', (data) => {
      shed.send(data);
    });

    shell.on('close', () => {
      shed.end();
    });

    // Incoming from the websocket to shell

    shed.on('text', (data) => {
      shell.write(data);
    });

    shed.on('end', () => {
      shell.kill();
    });
  });

  //////////

  this.start = (callback) => {
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
