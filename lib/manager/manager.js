'use strict';

require('barrkeep/pp');
const async = require('async');
const events = require('@mdbarr/events');

function Manager (options = {}) {
  this.version = require('../../package').version;

  //////////

  this.utils = require('barrkeep/utils');
  this.utils.hidden = (object, property, value) => {
    Object.defineProperty(object, property, {
      enumerable: false,
      value
    });
  };

  //////////

  this.config = this.utils.merge(require('../../defaults'), options, true);
  this.ephemeral = false;

  //////////

  this.events = new events.EventBus();

  this.cache = require('./cache')(this);
  this.database = require('../common/database')(this);

  //////////

  this.users = require('./users')(this);
  this.interviews = require('./interviews')(this);
  this.sessions = require('./sessions')(this);

  this.docker = require('./docker')(this);
  this.websocket = require('./websocket')(this);
  this.proxy = require('./proxy')(this);
  this.publicApi = require('./publicApi')(this);
  this.metadataApi = require('./metadataApi')(this);

  //////////

  this.start = (callback) => {
    callback = this.utils.callback(callback);

    async.series([
      this.docker.start,
      this.database.connect,
      this.users.load,
      this.interviews.load,
      this.metadataApi.start,
      this.publicApi.start
    ], (error) => {
      if (error) {
        console.log('[manager] encountered error in start up');
        console.log(error);
        console.log('[manager] exiting...');
        process.exit(1);
      } else {
        console.log('[manager] ready!');
      }
      return callback(error);
    });
  };
}

module.exports = Manager;
