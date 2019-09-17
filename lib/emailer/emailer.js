'use strict';

require('barrkeep/pp');
const async = require('async');
const events = require('@mdbarr/events');

function Emailer (options = {}) {
  this.version = require('../../package').version;
  this.utils = require('barrkeep/utils');
  this.config = this.utils.merge(require('../../defaults'), options, true);

  //////////

  this.events = new events.EventBus();

  //////////

  this.database = require('../common/database')(this);
  this.oplog = require('./oplog')(this, { ns: 'interrogative.interviews' });

  //////////

  this.start = (callback) => {
    callback = this.utils.callback(callback);

    async.series([
      this.database.connect,
      this.oplog.start
    ], (error) => {
      if (error) {
        console.log('[emailer] encountered error in start up');
        console.log(error);
        console.log('[emailer] exiting...');
        process.exit(1);
      } else {
        console.log('[emailer] ready!');
      }
      return callback(error);
    });
  };
}

module.exports = Emailer;
