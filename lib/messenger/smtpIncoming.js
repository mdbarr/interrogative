'use strict';

const { v4: uuid } = require('uuid');
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');

const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function SMTPIncoming (messenger) {
  this.id = uuid();

  const onConnect = (session, callback) => callback();

  const onMailFrom = (address, session, callback) => {
    session.sanitized = { from: address.address.replace(/^.*?<([^>])+>$/, '$1').trim() };

    console.log('[smtp-incoming] mail from', address, session.sanitized.from);

    return callback();
  };

  const onRcptTo = (address, session, callback) => {
    if (!address.address.endsWith(messenger.config.domain)) {
      return callback(`Mail to ${ address.address } not accepted`);
    }

    console.log('[smtp-incoming] rcpt to', address);

    const who = address.address.replace(/^.*?<([^>])+>$/, '$1').
      replace(`@${ messenger.config.domain }`, '').
      trim();

    session.sanitized.to = who;

    console.log('[smtp-incoming] who', who);

    if (uuidRegExp.test(who)) {
      return messenger.database.interviews.findOne({ id: who }, (error, interview) => {
        if (error || !interview) {
          return callback(new Error('Invalid recipient'));
        }

        session.sanitized.set = new Set(interview.users.map((user) => user.email));
        if (!session.sanitized.set.has(session.sanitized.from)) {
          return callback(new Error('Not authorized to email this address'));
        }
        console.log('[smtp-incoming] interview', interview);

        session.disposition = 'interview';
        session.interview = interview;
        return callback();
      });
    }
    return callback();
  };

  const onData = (stream, session, callback) => {
    simpleParser(stream, (error, message) => {
      if (error) {
        console.log('[smtp-incoming] parse error', error);
        return callback(error);
      }

      if (session.disposition) {
        messenger.events.emit({
          type: `smtp:message:${ session.disposition }`,
          data: {
            ...message,
            session,
          },
          source: this.id,
        });
      } else {
        messenger.events.emit({
          type: 'smtp:server:message',
          data: {
            ...message,
            session,
          },
          source: this.id,
        });
      }

      return callback();
    });
  };

  const onError = (error) => {
    console.log('[smtp-incoming] error', error);
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
      onData,
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
      onData,
    });
    this.secureServer.on('error', onError);

    this.port = messenger.config.messenger.smtp.incoming.port;
    this.securePort = messenger.config.messenger.smtp.incoming.securePort;

    this.host = messenger.config.messenger.smtp.incoming.host;

    return this.server.listen(this.port, this.host, (error) => {
      if (error) {
        console.log('[smtp-incoming] error', error);
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
