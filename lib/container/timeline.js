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
}

module.exports = function(container, options) {
  return new Timeline(container, options);
};
