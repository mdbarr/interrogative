'use strict';

require('barrkeep/pp');
const moment = require('moment');
const request = require('request');
const events = require('@mdbarr/events');

function Container (options = {}) {
  this.version = require('../../package').version;

  this.utils = require('../common/utils');
  this.config = this.utils.merge(require('../../defaults'), options, true);
  this.config.container.ttl = this.utils.milliseconds(this.config.container.ttl);
  this.config.container.heartbeat = this.utils.milliseconds(this.config.container.heartbeat);
  this.config.container.persistence.directory = this.config.container.persistence.directory.
    replace(/~/, process.env.HOME);

  //////////

  this.interview = { id: process.env.INTERVIEW_ID };

  this.startup = Date.now();
  this.heartbeat = this.startup;
  this.beat = () => { this.heartbeat = Date.now(); return this.heartbeat; };

  //////////

  this.events = new events.EventBus();

  //////////

  this.persistence = require('./persistence')(this);
  this.timeline = require('./timeline')(this);
  this.files = require('./files')(this);
  this.git = require('./git')(this);
  this.terminals = require('./terminals')(this);
  this.chat = require('./chat')(this);
  this.search = require('./search')(this);

  this.managementApi = require('./managementApi')(this);
  this.interactionApi = require('./interactionApi')(this);

  //////////

  this.validate = (auth) => {
    if (this.interview) {
      for (const user of this.interview.users) {
        if (user.id === auth && user.role === 'interviewer') {
          return true;
        }
      }
    }
    return false;
  };

  this.identity = (callback) => {
    const url = `http://manager:${ this.config.metadata.port }` +
          `/api/interview/${ this.interview.id }`;
    console.log('[container] requesting identity', url);

    request.get({
      url,
      json: true,
    }, (error, res, body) => {
      if (error) {
        console.log('[container] identity error', error);
        return callback(error);
      }
      Object.assign(this.interview, body);

      this.interview.uploadsPath = this.interview.uploadsPath.replace(/~/, process.env.HOME);

      this.persistence.apply(this.interview);

      return callback(null, this.interview);
    });
  };

  this.ready = (callback) => {
    request.put({
      url: `http://manager:${ this.config.metadata.port }` +
        `/api/interview/${ this.interview.id }/ready`,
      json: true,
      body: { ready: true },
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
        this.timeline.moment({
          type: 'container:stopped',
          description: 'Interview environment idle shutdown',
        });

        this.persistence.save(() => {
          console.log('[container] idle timeout, exiting',
            moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a'));

          process.exit(0);
        });
      }
    }, this.config.container.heartbeat);
  };

  this.start = (callback) => {
    callback = this.utils.callback(callback);
    this.persistence.start(() => {
      console.log('[container] starting',
        moment(this.startup).format('MMMM Do YYYY, h:mm:ss a'));

      return this.identity((error) => {
        if (error) {
          console.log('[container] error', error);
          return callback(error);
        }
        console.log('Container Identity:');
        console.pp(this.interview);

        this.files.start();
        this.git.start();

        return this.managementApi.start(() => this.interactionApi.start(() => this.ready((error) => {
          if (error) {
            console.log('[container] error', error);
            return callback(error);
          }

          this.events.emit({ type: 'container:started' });

          this.idle();
          return callback(null);
        })));
      });
    });
  };
}

module.exports = Container;
