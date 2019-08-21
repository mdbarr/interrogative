#!/usr/bin/env node
'use strict';

require('barrkeep/pp');
const restify = require('restify');
const events = require('@mdbarr/events');
const { merge } = require('barrkeep/utils');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function Manager (options = {}) {
  this.version = require('../../package').version;
  this.config = merge(require('../../defaults'), options, true);

  //////////

  this.events = new events.EventBus();

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

  this.start = (callback) => {
    this.api.listen(this.config.manager.port, this.config.manager.host, () => {
      const address = this.api.address();
      console.log(`${ this.config.name } Manager v${ this.version } ` +
                  `listening on http://${ address.address }:${ address.port }`);
      if (callback) {
        return callback(null);
      }
      return true;
    });
  };
}

const manager = new Manager();
manager.start();
