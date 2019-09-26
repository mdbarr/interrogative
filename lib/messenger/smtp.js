'use strict';

const { SMTPServer } = require('smtp-server');

function SMTP (messenger) {
  this.server = new SMTPServer({
    key: messenger.certificate.key,
    cert: messenger.certificate.cert
  });

  this.start = (callback) => {
    this.port = messenger.config.messenger.smtp.port;
    this.host = messenger.config.messenger.smtp.host;

    this.server.listen(this.port, this.host, (error) => {
      if (error) {
        console.log('[smtp] error', error);
        return callback(error);
      }
      console.log(`${ messenger.config.name } SMTP Server v${ messenger.version } ` +
                  `listening on smtp://${ this.host }:${ this.port }`);
      return callback(null);
    });
  };
}

module.exports = function(messenger, options) {
  return new SMTP(messenger, options);
};
