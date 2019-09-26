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

  this.certificate = require('../common/certificate')(this);
  this.oplog = require('../common/oplog')(this);
  this.database = require('../common/database')(this);

  this.smtp = require('./smtp')(this);

  //////////

  this.start = (callback) => {
    callback = this.utils.callback(callback);

    async.series([
      this.oplog.connect,
      this.database.connect,
      this.smtp.start
    ], (error) => {
      if (error) {
        console.log('[messenger] encountered error in start up');
        console.log(error);
        console.log('[messenger] exiting...');
        process.exit(1);
      } else {
        console.log('[messenger] ready!');
      }
      return callback(error);
    });
  };
}

module.exports = Messanger;
