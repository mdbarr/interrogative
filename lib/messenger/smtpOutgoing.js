'use strict';

const uuid = require('uuid/v4');
const nodemailer = require('nodemailer');

function SMTPOutgoing (messenger) {
  this.id = uuid();

  this.configure = () => {
    this.config = {
      host: process.env.INTERROGATIVE_MAIL_HOST ||
        messenger.config.messenger.smtp.outgoing.host,
      port: Number(process.env.INTERROGATIVE_MAIL_PORT) ||
        messenger.config.messenger.smtp.outgoing.port,
      secure: false,
    };

    this.config.secure = this.config.port === 465;

    if (messenger.config.messenger.smtp.outgoing.auth) {
      this.config.auth = messenger.config.messenger.smtp.outgoing.auth;
    }

    if (process.env.INTERROGATIVE_MAIL_USER && process.env.INTERROGATIVE_MAIL_PASSWORD) {
      this.config.auth = {
        user: process.env.INTERROGATIVE_MAIL_USER,
        pass: process.env.INTERROGATIVE_MAIL_PASSWORD,
      };
    }

    this.transport = nodemailer.createTransport(this.config);
    console.log(`${ messenger.config.name } SMTP Transport` +
                ` configured through ${ this.config.host }`);
  };

  this.send = (message, callback) => {
    this.transport.sendMail(message, callback);
  };

  this.configure();
}

module.exports = function(messenger, options) {
  return new SMTPOutgoing(messenger, options);
};
