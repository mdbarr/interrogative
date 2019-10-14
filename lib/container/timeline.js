'use strict';

const uuid = require('uuid/v4');

function Timeline (container) {
  this.timeline = [];

  this.moment = ({
    id, type, timestamp = Date.now(), description, data
  }) => {
    const moment = {
      id: id || uuid(),
      type,
      timestamp,
      description,
      data: data || null
    };

    console.log('[moment] added', moment);

    this.timeline.unshift(moment);
  };

  //////////

  container.events.on('container:started', () => {
    this.moment({
      type: 'container:started',
      description: 'interview environment started'
    });
  });

  container.events.on('connected', (event) => {
    this.moment({
      type: 'user:connected',
      description: `${ event.data.name } joined`,
      data: event.data
    });
  });

  container.events.on('file:upload:success', (event) => {
    this.moment({
      type: 'file:uploaded',
      description: `${ event.data.name } uploaded`,
      data: event.data
    });
  });

  container.events.on('notification:create:success', (event) => {
    this.moment({
      type: 'file:created',
      description: `${ event.data.name } created`,
      data: event.data
    });
  });

  container.events.on('files:file:opened', (event) => {
    this.moment({
      type: 'file:opened',
      description: `${ event.data.path } opened`,
      data: event.data
    });
  });

  container.events.on('files:file:closed', (event) => {
    this.moment({
      type: 'file:closed',
      description: `${ event.data.path } closed`,
      data: event.data
    });
  });

  container.events.on('messages:message:send', (event) => {
    this.moment({
      type: 'chat:message',
      description: `<${ event.data.name }> ${ event.data.text }`,
      data: event.data
    });
  });

}

module.exports = function(container, options) {
  return new Timeline(container, options);
};
