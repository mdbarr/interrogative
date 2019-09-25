'use strict';

const { SMTPServer } = require('smtp-server');

function SMTP (messanger) {
  this.server = new SMTPServer({
    key: messanger.certificate.key,
    cert: messanger.certificate.cert
  });

  this.start = (callback) => {
    this.port = messanger.config.messanger.smtp.port;
    this.host = messanger.config.messanger.smtp.host;

    this.server.listen(this.port, this.host, (error) => {
      if (error) {
        console.log('[smtp] error', error);
        return callback(error);
      }
      console.log(`${ messanger.config.name } SMTP Server v${ messanger.version } ` +
                  `listening on smtp://${ this.host }:${ this.port }`);
      return callback(null);
    });
  };
}

module.exports = function(messanger, options) {
  return new SMTP(messanger, options);
};
