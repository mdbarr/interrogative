#!/usr/bin/env node
'use strict';

const pty = require('node-pty');
const restify = require('restify');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

const api = restify.createServer({
  name: 'Interogative',
  ignoreTrailingSlash: true,
  strictNext: true,
  handleUpgrades: true
});

api.ws = new Watershed();

/// ///////

const cors = corsMiddleware({
  origins: [ '*' ],
  allowHeaders: [ 'Authorization' ],
  exposeHeaders: [ 'Authorization' ]
});

api.pre(cors.preflight);
api.use(cors.actual);

/// ///////

api.use(restify.pre.sanitizePath());
api.pre(restify.plugins.pre.dedupeSlashes());
api.use(restify.plugins.dateParser());
api.use(restify.plugins.queryParser());
api.use(restify.plugins.bodyParser());
api.use(restify.plugins.authorizationParser());

/// ///////

api.use((req, res, next) => {
  next();
});

/// ///////

api.get('/attach/shell', (req, res, next) => {
  if (!res.claimUpgrade) {
    next(new Error('Connection Must Upgrade For WebSockets'));
    return;
  }

  const upgrade = res.claimUpgrade();
  const shed = api.ws.accept(req, upgrade.socket, upgrade.head);

  const shell = pty.spawn('/bin/bash', [ ], {
    name: 'xterm-256color',
    cwd: process.env.HOME,
    env: {
      HOME: process.env.HOME,
      USER: process.env.USER,
      LANG: process.env.LANG,
      PATH: process.env.PATH,

      INTEROGATIVE: '1'
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

/// //////

api.listen(3169, () => {
  console.log('Interogative listening on http://0.0.0.0:3169');
});
