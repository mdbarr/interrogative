'use strict';

function Chat (container) {
  this.messages = [];

  //////////

  this.emitMessages = () => {
    container.events.emit({
      type: 'messages:history:list',
      data: this.messages,
    });
  };

  this.clear = () => {
    this.messages = [];
    this.history();
  };

  //////////

  container.events.on('messages:message:send', (event) => {
    this.messages.push(event.data);
  });

  container.events.on('connected', () => {
    this.emitMessages();
  });

  container.events.on('tools:messages:clear', (event) => {
    if (container.validate(event.data.auth)) {
      this.messages = [];
      this.emitMessages();
    }
  });
}

module.exports = (container, options) => {
  return new Chat(container, options);
};
