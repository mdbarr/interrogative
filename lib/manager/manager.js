#!/usr/bin/env node
'use strict';

require('barrkeep/pp');
const events = require('@mdbarr/events');

function Manager (options = {}) {
  this.version = require('../../package').version;
  this.utils = require('barrkeep/utils');

  this.config = this.utils.merge(require('../../defaults'), options, true);
  this.ephemeral = false;

  //////////

  this.events = new events.EventBus();

  //////////

  this.interviews = require('./interviews')(this);
  this.docker = require('./docker')(this);
  this.websocket = require('./websocket')(this);
  this.publicApi = require('./publicApi')(this);
  this.metadataApi = require('./metadataApi')(this);

  //////////

  this.start = (callback) => {
    callback = this.utils.callback(callback);

    this.interviews.load();

    this.metadataApi.start(() => {
      this.publicApi.start(() => {
        callback();
      });
    });
  };
}

const manager = new Manager();
manager.start();
