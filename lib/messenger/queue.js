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
    passwordReset: this.loadTemplate('password-reset'),
    scheduledCandidate: this.loadTemplate('scheduled-candidate'),
    scheduledInterviewer: this.loadTemplate('scheduled-interviewer')
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

  this.send = (envelope) => {
    this.queue.push({
      name: `${ envelope.subject } (${ envelope.to })`,
      func: (callback) => {
        messenger.smtp.outgoing.send(envelope, (error, info) => {
          if (error) {
            console.log('[messenger] outgoing error', error);
            return callback(error);
          }
          console.log('[messenger] message sent', info.response);
          return callback(error, info.response);
        });
      }
    });
  };

  this.prepareAndSend = (template, message) => {
    const envelope = this.envelope(template, message);
    this.sendAndUpdate(envelope, message.id);
  };

  //////////

  messenger.events.on('mongo:interrogative.messages:insert', (event) => {
    messenger.database.messages.findOne({ id: event.data.id }, (error, message) => {
      if (!error && !message.sent &&
          (message.send === 'now' ||
           typeof message.send === 'number' && Date.now() >= message.send)) {
        if (message.object === 'signup') {
          this.prepareAndSend(this.templates.signup, message);
        } else if (message.object === 'reset') {
          this.prepareAndSend(this.templates.passwordReset, message);
        } else if (message.object === 'scheduled-candidate') {
          this.prepareAndSend(this.templates.scheduledCandidate, message);
        } else if (message.object === 'scheduled-interviewer') {
          this.prepareAndSend(this.templates.scheduledInterviewer, message);
        }
      }
    });
  });

  messenger.events.on('smtp:message:interview', (event) => {
    try {
      const id = event.data.session.interview.id;
      const address = `${ id }@${ messenger.config.domain }`;

      const users = event.data.session.interview.users.
        filter((user) => {
          return user.email !== event.data.session.sanitized.from &&
            !user.email.endsWith(messenger.config.domain);
        }).
        map((user) => {
          return `"${ user.name }" <${ user.email }>`;
        });

      const from = `"${ event.data.from.value[0].name }" <${ address }>`;

      let html = event.data.html;
      let text = event.data.text;

      event.data.session.interview.users.forEach((user) => {
        const regexp = new RegExp(user.email, 'g');

        html = html.replace(regexp, address);
        text = text.replace(regexp, address);
      });

      for (const user of users) {
        const envelope = {
          from,
          to: user,
          subject: event.data.subject,
          html: event.data.html,
          text: event.data.text
        };
        this.send(envelope);
      }
    } catch (error) {
      console.log('[queue] error in interview disposition', error);
    }
  });
}

module.exports = function(messenger, options) {
  return new Queue(messenger, options);
};
