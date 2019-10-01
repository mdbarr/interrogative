'use strict';

function Handlers (messenger) {
  messenger.events.on('mongo:interrogative.messages:insert', (event) => {
    console.pp(event);
  });
}

module.exports = function(messenger, options) {
  return new Handlers(messenger, options);
};
