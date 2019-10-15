'use strict';

const uuid = require('uuid/v4');

function Timeline (container) {
  this.timeline = [];

  this.state = {
    files: new Map(),
    diffs: new Map()
  };

  //////////

  this.emitTimeline = () => {
    const data = [];

    for (const item of this.timeline) {
      data.push({
        id: item.id,
        type: item.type,
        icon: item.icon,
        description: item.description,
        timestamp: item.timestamp
      });
    }

    container.events.emit({
      type: 'timeline:events:list',
      data,
      scope: { role: 'interviewer' }
    });
  };

  //////////

  this.icon = (type, data) => {
    let icon = data && data.icon ? data.icon : '';

    if (type.startsWith('container')) {
      icon = 'docker';
    } else if (type.startsWith('user')) {
      icon = 'account';
    } else if (type === 'file:uploaded') {
      icon = 'upload';
    } else if (type.startsWith('chat')) {
      icon = 'forum';
    }

    return icon.startsWith('mdi-') ? icon : `mdi-${ icon }`;
  };

  this.moment = ({
    id, type, timestamp = Date.now(), description, icon, data
  }) => {
    const moment = {
      id: id || uuid(),
      type,
      timestamp,
      description,
      icon: icon ? icon : this.icon(type, data),
      data: data || null
    };

    console.log('[moment] added', moment);

    this.timeline.unshift(moment);

    this.emitTimeline();
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
    if (!this.state.files.has(event.data.path)) {
      this.state.files.set(event.data.path, event.data);

      this.moment({
        type: 'file:opened',
        description: `${ event.data.path } opened`,
        data: event.data
      });
    }
  });

  container.events.on('files:file:closed', (event) => {
    if (this.state.files.has(event.data.path)) {
      this.state.files.delete(event.data.path);

      this.moment({
        type: 'file:closed',
        description: `${ event.data.path } closed`,
        data: event.data
      });
    }
  });

  container.events.on('messages:message:send', (event) => {
    this.moment({
      type: 'chat:message',
      description: `<${ event.data.name }> ${ event.data.text }`,
      data: event.data
    });
  });

  container.events.on('notification:create:success', (event) => {
    this.moment({
      type: `file:create:${ event.data.type }`,
      description: `${ event.data.name } created`,
      data: event.data,
      icon: event.data.type === 'directory' ? 'mdi-folder' : 'mdi-file'
    });
  });

  container.events.on('notification:create:failed', (event) => {
    this.moment({
      type: `file:create:${ event.data.type }`,
      description: `${ event.data.name } failed`,
      data: event.data,
      icon: event.data.type === 'directory' ? 'mdi-folder' : 'mdi-file'
    });
  });
}

module.exports = function(container, options) {
  return new Timeline(container, options);
};
