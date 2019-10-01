'use strict';

const uuid = require('uuid/v4');
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');

function SMTPIncoming (messenger) {
  this.id = uuid();

  const onConnect = (session, callback) => {
    return callback();
  };

  const onMailFrom = (address, session, callback) => {
    return callback();
  };

  const onRcptTo = (address, session, callback) => {
    if (!address.address.endsWith(messenger.config.domain)) {
      return callback(`Mail to ${ address.address } not accepted`);
    }
    return callback();
  };

  const onData = (stream, session, callback) => {
    simpleParser(stream, (error, message) => {
      if (error) {
        console.log('[smtp] parse error', error);
        return callback(error);
      }

      messenger.events.emit({
        type: 'smtp:server:message',
        data: {
          ...message,
          session
        },
        source: this.id
      });

      return callback();
    });
  };

  const onError = (error) => {
    console.log('[smtp] error', error);
  };

  /////////

  this.start = (callback) => {
    this.server = new SMTPServer({
      name: messenger.config.domain,
      authOptional: true,
      key: messenger.certificate.key,
      cert: messenger.certificate.cert,
      onConnect,
      onMailFrom,
      onRcptTo,
      onData
    });
    this.server.on('error', onError);

    this.secureServer = new SMTPServer({
      name: messenger.config.domain,
      secure: true,
      authOptional: true,
      key: messenger.certificate.key,
      cert: messenger.certificate.cert,
      onConnect,
      onMailFrom,
      onRcptTo,
      onData
    });
    this.secureServer.on('error', onError);

    this.port = messenger.config.messenger.smtp.incoming.port;
    this.securePort = messenger.config.messenger.smtp.incoming.securePort;

    this.host = messenger.config.messenger.smtp.incoming.host;

    return this.server.listen(this.port, this.host, (error) => {
      if (error) {
        console.log('[smtp] error', error);
        return callback(error);
      }
      console.log(`${ messenger.config.name } SMTP Server v${ messenger.version } ` +
                  `listening on smtp://${ this.host }:${ this.port }`);

      return this.secureServer.listen(this.securePort, this.host, (error) => {
        if (error) {
          console.log('[smtps] error', error);
          return callback(error);
        }
        console.log(`${ messenger.config.name } SMTPS Server v${ messenger.version } ` +
                    `listening on smtps://${ this.host }:${ this.securePort }`);

        return callback(null);
      });
    });
  };
}

module.exports = function(messenger, options) {
  return new SMTPIncoming(messenger, options);
};
