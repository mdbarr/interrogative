#!/usr/bin/env node
'use strict';

require('barrkeep/pp');
const fs = require('fs');
const restify = require('restify');
const { resolve } = require('path');
const events = require('@mdbarr/events');
const { merge } = require('barrkeep/utils');
const Watershed = require('watershed').Watershed;
const corsMiddleware = require('restify-cors-middleware');

function Manager (options = {}) {
  this.version = require('../../package').version;
  this.config = merge(require('../../defaults'), options, true);

  //////////

  this.events = new events.EventBus();
  this.interviews = new Map();

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

  this.api.get('/interview/:id', (req, res, next) => {
    if (this.interviews.has(req.params.id)) {
      res.send(200, this.interviews.get(req.params.id));
      return next();
    }
    res.send(404, { message: `${ req.params.id } not found` });
    return next();
  });

  //////////

  this.loadInterviews = () => {
    const files = fs.readdirSync(this.config.manager.interviews);
    files.forEach((file) => {
      try {
        const path = resolve(process.cwd(), this.config.manager.interviews, file);

        const interview = JSON.parse(fs.readFileSync(path));
        interview.state.path = path;

        interview.users.forEach((user) => {
          this.interviews.set(user.id, interview);
        });
      } catch (error) {
        console.log('Error loading interview', file);
        console.log(error);
      }
    });
  };

  this.start = (callback) => {
    this.loadInterviews();

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
