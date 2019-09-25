'use strict';

require('barrkeep/pp');
const async = require('async');
const events = require('@mdbarr/events');

function Messanger (options = {}) {
  this.version = require('../../package').version;
  this.utils = require('barrkeep/utils');
  this.config = this.utils.merge(require('../../defaults'), options, true);

  //////////

  this.events = new events.EventBus();

  //////////

  this.oplog = require('../common/oplog')(this);
  this.database = require('../common/database')(this);

  //////////

  this.start = (callback) => {
    callback = this.utils.callback(callback);

    async.series([
      this.oplog.connect,
      this.database.connect
    ], (error) => {
      if (error) {
        console.log('[messanger] encountered error in start up');
        console.log(error);
        console.log('[messanger] exiting...');
        process.exit(1);
      } else {
        console.log('[messanger] ready!');
      }
      return callback(error);
    });
  };
}

module.exports = Messanger;
