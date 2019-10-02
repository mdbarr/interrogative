'use strict';

const fs = require('fs');
const async = require('async');
const { join } = require('path');
const { Uscript } = require('@mdbarr/uscript');
const transforms = require('barrkeep/transforms');

function Queue (messenger) {
  this.queue = async.queue((task, callback) => {
    console.log('[queue] executing task:', task.name);
    const start = Date.now();
    return task.func((error, result) => {
      const duration = Date.now() - start;
      console.log(`[queue] task complete (${ duration } ms):`, error, result);
      return callback(error, result);
    });
  }, messenger.config.messenger.concurrency);

  //////////

  this.uscript = new Uscript({ environment: {
    domain: messenger.config.domain,
    url: messenger.config.url,
    logoURI: this.logoURI,
    first (value) {
      return value.replace(/^([^\s]+)\s+.*$/, '$1');
    },
    with (value) {
      if (value) {
        return ` with ${ value }`;
      }
      return '';
    },
    ...transforms
  } });

  this.handlebars = (string, environment) => {
    return string.replace(/{{(.*?)}}/g, (match, expression) => {
      let evaluated;

      expression = expression.trim();

      try {
        evaluated = this.uscript.eval(expression, environment);
      } catch (error) {
        console.log('[messenger] template expansion error', error);
      }

      return evaluated;
    });
  };

  //////////

  this.loadTemplate = (name) => {
    return fs.readFileSync(join(__dirname, `../../templates/${ name }.html`)).toString();
  };

  this.templates = {
    signup: this.loadTemplate('signup'),
    passwordReset: this.loadTemplate('password-reset')
  };

  this.subject = (body) => {
    const [ , subject ] = body.match(/<title>(.*?)<\/title>/);
    return subject.trim();
  };

  //////////

  this.envelope = (template, data) => {
    const body = this.handlebars(template, data);
    const envelope = {
      from: `"interrogative.io" <no-reply@${ messenger.config.domain }>`,
      to: `"${ data.name }" <${ data.email }>`,
      subject: this.subject(body),
      html: body
    };

    return envelope;
  };

  this.sendAndUpdate = (envelope, id) => {
    this.queue.push({
      name: `${ envelope.subject } (${ envelope.to })`,
      func: (callback) => {
        messenger.smtp.outgoing.send(envelope, (error, info) => {
          if (error) {
            console.log('[messenger] outgoing error', error);
          } else {
            console.log('[messenger] message sent', info.response);
            messenger.database.messages.updateOne({ id },
              { $set: { sent: true } },
              (error) => {
                if (error) {
                  console.log('[messenger] update error', error);
                }
                return callback(error, info.response);
              });
          }
        });
      }
    });
  };

  //////////

  this.signup = (message) => {
    const envelope = this.envelope(this.templates.signup, message);
    this.sendAndUpdate(envelope, message.id);
  };

  //////////

  this.reset = (message) => {
    const envelope = this.envelope(this.templates.passwordReset, message);
    this.sendAndUpdate(envelope, message.id);
  };

  //////////

  messenger.events.on('mongo:interrogative.messages:insert', (event) => {
    messenger.database.messages.findOne({ id: event.data.id }, (error, message) => {
      if (!error && !message.sent) {
        if (message.object === 'signup') {
          this.signup(message);
        } else if (message.object === 'reset') {
          this.reset(message);
        }
      }
    });
  });
}

module.exports = function(messenger, options) {
  return new Queue(messenger, options);
};
