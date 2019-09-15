'use strict';

const async = require('async');
const MongoClient = require('mongodb').MongoClient;

function Database (parent) {
  this.client = new MongoClient(parent.config.database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  //////////

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

      this.db = this.client.db();

      this.interviews = this.db.collection('interviews');
      this.users = this.db.collection('users');

      console.log(`${ parent.config.name } Database Connector` +
                  ` v${ parent.version } connected`);

      return callback(null);
    });
  };
}

module.exports = function(parent, options) {
  return new Database(parent, options);
};
