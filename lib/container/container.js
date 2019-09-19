'use strict';

require('barrkeep/pp');
const moment = require('moment');
const request = require('request');
const events = require('@mdbarr/events');

function Container (options = {}) {
  this.version = require('../../package').version;

  this.utils = require('barrkeep/utils');
  this.utils.hidden = (object, property, value) => {
    Object.defineProperty(object, property, {
      enumerable: false,
      value
    });
  };

  this.config = this.utils.merge(require('../../defaults'), options, true);
  this.config.container.ttl = this.utils.milliseconds(this.config.container.ttl);
  this.config.container.heartbeat = this.utils.milliseconds(this.config.container.heartbeat);

  //////////

  this.interview = { id: process.env.INTERVIEW_ID };

  this.startup = Date.now();
  this.heartbeat = this.startup;

  //////////

  this.events = new events.EventBus();

  //////////

  this.files = require('./files')(this);
  this.git = require('./git')(this);
  this.terminals = require('./terminals')(this);
  this.chat = require('./chat')(this);
  this.search = require('./search')(this);

  this.managementApi = require('./managementApi')(this);
  this.interactionApi = require('./interactionApi')(this);

  //////////

  this.identity = (callback) => {
    request.get({
      url: `http://manager:${ this.config.metadata.port }` +
        `/api/interview/${ this.interview.id }`,
      json: true
    }, (error, res, body) => {
      if (error) {
        return callback(error);
      }
      Object.assign(this.interview, body);

      this.interview.uploadsPath = this.interview.uploadsPath.replace(/~/, process.env.HOME);

      return callback(null, this.interview);
    });
  };

  this.ready = (callback) => {
    request.put({
      url: `http://manager:${ this.config.metadata.port }` +
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

  this.idle = () => {
    console.log('[container] started',
      moment(this.startup).format('MMMM Do YYYY, h:mm:ss a'));

    setInterval(() => {
      if (Date.now() > this.heartbeat + this.config.container.ttl) {
        console.log('[container] idle timeout, exiting',
          moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a'));

        process.exit(0);
      }
    }, this.config.container.heartbeat);
  };

  this.start = (callback) => {
    callback = this.utils.callback(callback);

    console.log('[container] starting',
      moment(this.startup).format('MMMM Do YYYY, h:mm:ss a'));

    return this.identity((error) => {
      if (error) {
        return callback(error);
      }
      console.log('Container Identity:');
      console.pp(this.interview);

      this.files.start();
      this.git.start();

      return this.managementApi.start(() => {
        return this.interactionApi.start(() => {
          return this.ready((error) => {
            this.idle();
            return callback(error);
          });
        });
      });
    });
  };
}

module.exports = Container;
