'use strict';

const async = require('async');
const MongoClient = require('mongodb').MongoClient;

function Database (manager) {
  this.client = new MongoClient(manager.config.database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  //////////

  this.connected = false;

  this.connect = (callback) => {
    return async.until((test) => {
      return this.client.connect((error) => {
        if (error) {
          return test(null, false);
        }
        return test(null, true);
      });
    }, (next) => {
      return setTimeout(() => {
        return next(null);
      }, 1000);
    }, (error) => {
      if (error) {
        return callback(error);
      }

      this.connected = true;

      this.db = this.client.db();

      this.collections = {
        users: this.db.collection('users'),
        interviews: this.db.collection('interviews')
      };

      console.log(`${ manager.config.name } Manager Database Connector` +
                  ` v${ manager.version } connected`);

      return callback(null);
    });
  };
}

module.exports = function(manager, options) {
  return new Database(manager, options);
};
