'use strict';

const fs = require('fs');
const { join } = require('path');
const { Uscript } = require('@mdbarr/uscript');
const transforms = require('barrkeep/transforms');

function Handlers (messenger) {
  this.logoURI = `${ messenger.config.url }/img/logo.svg`;

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
    scheduled: {
      interviewer: this.loadTemplate('interviewer-scheduled'),
      candidate: this.loadTemplate('candidate-scheduled')
    }
  };

  this.subject = (body) => {
    const [ , subject ] = body.match(/<title>(.*?)<\/title>/);
    return subject;
  };

  //////////

  this.signup = (data) => {
    console.pp('signup', data);
    const body = this.handlebars(this.templates.signup, data);
    const envelope = {
      from: `"interrogative.io" <no-reply@${ messenger.config.domain }>`,
      to: `"${ data.name }" <${ data.email }>`,
      subject: this.subject(body),
      html: body
    };

    messenger.smtp.outgoing.send(envelope, (error, info) => {
      if (error) {
        console.log('[messenger] outgoing error', error);
      } else {
        console.log('[messenger] message sent', info.response);
        messenger.database.messages.deleteOne({ id: data.id }, (error) => {
          if (error) {
            console.log('[messenger] removal error', error);
          }
        });
      }
    });
  };

  //////////

  messenger.events.on('mongo:interrogative.messages:insert', (event) => {
    if (event.data.object === 'signup') {
      this.signup(event.data);
    }
  });
}

module.exports = function(messenger, options) {
  return new Handlers(messenger, options);
};
