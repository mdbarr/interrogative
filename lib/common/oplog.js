'use strict';

const async = require('async');
const MongoClient = require('mongodb').MongoClient;

const events = {
  i: 'insert',
  u: 'update',
  d: 'delete'
};

function Oplog (parent) {
  this.connect = (callback) => {
    return setTimeout(() => {
      return async.until((test) => {
        this.client = new MongoClient(parent.config.oplog.url, {
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
          console.log('[oplog] failed to connect', error);
          return callback(error);
        }

        this.db = this.client.db();

        this.oplog = this.db.collection('oplog.rs');

        this.tail();

        return callback(null);
      });
    }, parent.config.database.slowStart ? parent.config.database.slowStart : 0);
  };

  this.tail = () => {
    this.stream = this.oplog.find({ }, {
      awaitdata: true,
      noCursorTimeout: true,
      numberOfRetries: Number.MAX_VALUE,
      tailable: true
    }).
      stream();

    this.stream.on('data', (document) => {
      parent.events.emit({
        type: 'mongo:oplog:op',
        data: document,
        source: 'mongo:oplog'
      });

      const type = events[document.op];
      if (type) {
        parent.events.emit({
          type: `mongo:oplog:${ type }`,
          data: document,
          source: 'mongo:oplog'
        });

        if (document.ns) {
          parent.events.emit({
            type: `mongo:${ document.ns }:${ type }`,
            data: document.o,
            source: 'mongo:oplog'
          });
        }
      }
    });

    this.stream.on('end', () => {
      setTimeout(this.tail, parent.config.oplog.retry);
    });
  };

  //////////
}

module.exports = function(parent, options) {
  return new Oplog(parent, options);
};
