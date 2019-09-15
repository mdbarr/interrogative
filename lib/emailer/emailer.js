'use strict';

const async = require('async');

function Emailer (options = {}) {
  this.version = require('../../package').version;
  this.utils = require('barrkeep/utils');
  this.config = this.utils.merge(require('../../defaults'), options, true);

  //////////

  this.database = require('../common/database')(this);

  //////////

  this.start = (callback) => {
    callback = this.utils.callback(callback);

    async.series([
      this.database.connect
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
