'use strict';

const oplog = require('mongo-oplog');

function Oplog (emailer, options) {
  this.start = (callback) => {
    this.oplog = oplog(emailer.config.oplog.url, options);

    this.oplog.on('insert', (document) => {
      emailer.events.emit({
        type: 'mongo:oplog:insert',
        data: document
      });

      console.log('[oplog] insert:');
      console.pp(document);
    });

    this.oplog.on('update', (document) => {
      emailer.events.emit({
        type: 'mongo:oplog:update',
        data: document
      });

      console.log('[oplog] update:');
      console.pp(document);
    });

    this.oplog.on('delete', (document) => {
      emailer.events.emit({
        type: 'mongo:oplog:delete',
        data: document
      });

      console.log('[oplog] delete:');
      console.pp(document);
    });

    this.oplog.on('error', (error) => {
      console.log('[oplog] error:', error);
    });

    this.oplog.tail().
      then(() => {
        console.log(`${ emailer.config.name } Oplog Monitor` +
                    ` v${ emailer.version } connected`);

        callback(null);
      });
  };
}

module.exports = function(emailer, options) {
  return new Oplog(emailer, options);
};
