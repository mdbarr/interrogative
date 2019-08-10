#!/usr/bin/env node
'use strict';

const restify = require('restify');
const pty = require('node-pty');
const Watershed = require('watershed').Watershed;

const api = restify.createServer({
  name: 'Interogative',
  ignoreTrailingSlash: true,
  strictNext: true,
  handleUpgrades: true
});

api.ws = new Watershed();

api.use(restify.pre.sanitizePath());
api.pre(restify.plugins.pre.dedupeSlashes());
api.use(restify.plugins.dateParser());
api.use(restify.plugins.queryParser());
api.use(restify.plugins.bodyParser());
api.use(restify.plugins.authorizationParser());

api.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
  res.header('Access-Control-Allow-Headers', [
    'Access-Control-Allow-Headers', 'Origin', 'Accept', 'X-Requested-With',
    'Content-Type', 'Access-Control-Request-Method', 'Access-Control-Request-Headers',
    'Authorization' ].join(', '));
  next();
});

api.get('/attach/shell', (req, res, next) => {
  if (!res.claimUpgrade) {
    next(new Error('Connection Must Upgrade For WebSockets'));
    return;
  }

  console.log(req.query);

  const upgrade = res.claimUpgrade();
  const shed = api.ws.accept(req, upgrade.socket, upgrade.head);

  const shell = pty.spawn('/bin/bash', [], {
    name: 'xterm-256color',
    cwd: process.env.PWD,
    env: process.env,
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

api.listen(3169, () => {
  console.log('Interogative listening on http://0.0.0.0:3169');
});
