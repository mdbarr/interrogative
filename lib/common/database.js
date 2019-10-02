'use strict';

const async = require('async');
const MongoClient = require('mongodb').MongoClient;

function Database (parent) {
  this.connect = (callback) => {
    return setTimeout(() => {
      return async.until((test) => {
        this.client = new MongoClient(parent.config.database.url, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });

        return this.client.connect((error) => {
          if (error) {
            return test(null, false);
          }
          return test(null, true);
        });
      }, (next) => {
        return setTimeout(() => {
          return next(null);
        }, parent.config.database.retry || 5000);
      }, (error) => {
        if (error) {
          console.log('[database] failed to connect', error);
          return callback(error);
        }

        this.db = this.client.db();

        this.interviews = this.db.collection('interviews');
        this.messages = this.db.collection('messages');
        this.users = this.db.collection('users');

        console.log(`${ parent.config.name } Database Connector` +
                  ` v${ parent.version } connected`);

        return callback(null);
      });
    }, parent.config.database.slowStart ? parent.config.database.slowStart : 0);
  };
}

module.exports = function(parent, options) {
  return new Database(parent, options);
};
