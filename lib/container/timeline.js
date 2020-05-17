'use strict';

const { v4: uuid } = require('uuid');

function Timeline (container) {
  this.timeline = [];

  this.state = {
    files: new Map(),
    diffs: new Map(),
  };

  //////////

  this.emitTimeline = () => {
    const data = [];

    for (const item of this.timeline) {
      data.push({
        id: item.id,
        type: item.type,
        icon: item.icon,
        color: item.color,
        description: item.description.replace(process.env.HOME, '~'),
        timestamp: item.timestamp,
      });
    }

    container.events.emit({
      type: 'timeline:events:list',
      data,
      scope: { role: 'interviewer' },
    });
  };

  //////////

  this.icon = (type, data) => {
    let icon = data && data.icon ? data.icon : '';

    if (type.startsWith('container')) {
      icon = 'interrogative';
    } else if (type.startsWith('user:joined')) {
      icon = 'account-plus mdi-flip-h';
    } else if (type.startsWith('user:left')) {
      icon = 'account-remove mdi-flip-h';
    } else if (type.startsWith('user')) {
      icon = 'account';
    } else if (type === 'file:closed') {
      icon = 'file-remove';
    } else if (type === 'file:uploaded') {
      icon = 'upload';
    } else if (type.startsWith('file:') && !icon) {
      icon = 'file';
    } else if (type.startsWith('chat')) {
      icon = 'forum';
    }

    return icon.startsWith('mdi-') ? icon : `mdi-${ icon }`;
  };

  this.moment = ({
    id, type, timestamp = Date.now(), description, icon, color, data,
  }) => {
    const moment = {
      id: id || uuid(),
      type,
      timestamp,
      description,
      icon: icon ? icon : this.icon(type, data),
      color: color || '#0087af',
      data: data || null,
    };

    console.log('[moment] added', moment);

    this.timeline.unshift(moment);

    this.emitTimeline();
  };

  //////////

  container.events.on('container:started', () => {
    this.moment({
      type: 'container:started',
      description: 'Interview environment started!',
    });
  });

  container.events.on('notification:user:joined', (event) => {
    this.moment({
      type: 'user:joined',
      description: event.data.message,
      data: event.data,
    });
  });

  container.events.on('notification:user:left', (event) => {
    this.moment({
      type: 'user:left',
      description: event.data.message,
      data: event.data,
    });
  });

  container.events.on('file:upload:success', (event) => {
    this.moment({
      type: 'file:uploaded',
      description: `${ event.data.name } uploaded`,
      data: event.data,
    });
  });

  container.events.on('files:file:opened', (event) => {
    if (!this.state.files.has(event.data.path)) {
      this.state.files.set(event.data.path, event.data);

      this.moment({
        type: 'file:opened',
        description: `${ event.data.path } opened`,
        data: event.data,
      });
    }
  });

  container.events.on('files:file:closed', (event) => {
    if (this.state.files.has(event.data.path)) {
      this.state.files.delete(event.data.path);

      this.moment({
        type: 'file:closed',
        description: `${ event.data.path } closed`,
        data: event.data,
      });
    }
  });

  container.events.on('messages:message:send', (event) => {
    this.moment({
      type: 'chat:message',
      description: `<${ event.data.name }> ${ event.data.text }`,
      data: event.data,
    });
  });

  container.events.on('notification:create:success', (event) => {
    this.moment({
      type: `file:create:${ event.data.type }`,
      description: `${ event.data.path }/${ event.data.name } Created`,
      data: event.data,
      icon: event.data.type === 'directory' ? 'mdi-folder-plus' : 'mdi-file-plus',
    });
  });

  container.events.on('notification:create:failed', (event) => {
    this.moment({
      type: `file:create:${ event.data.type }`,
      description: `Failed to create ${ event.data.path }/${ event.data.name }`,
      data: event.data,
      icon: event.data.type === 'directory' ? 'mdi-folder-alert' : 'mdi-file-alert',
      color: 'red',
    });
  });

  //////////

  container.events.debounce('fs:add:*', { timeout: 1000 }, (events) => {
    if (events.length === 1) {
      const event = events[0];

      this.moment({
        type: 'file:create:file',
        description: `${ event.data.filename } Created`,
        data: event.data,
        icon: 'mdi-file-plus',
      });
    } else {
      this.moment({
        type: 'file:create:files',
        description: `Created ${ container.utils.formatNumber(events.length) } files`,
        data: events.map((event) => event.data),
        icon: 'mdi-file-multiple',
      });
    }
  });

  container.events.debounce('fs:change:*', {
    timeout: 2000,
    last: true,
    unique: true,
  }, (event) => {
    console.pp(event);
    this.moment({
      type: 'file:changed:file',
      description: `${ event.data.filename } Changed`,
      data: event.data,
      icon: 'mdi-content-save',
    });
  });

  container.events.debounce('fs:unlink:*', { timeout: 1000 }, (events) => {
    if (events.length === 1) {
      const event = events[0];

      this.moment({
        type: 'file:delete:file',
        description: `${ event.data.filename } Deleted`,
        data: event.data,
        icon: 'mdi-file-remove',
      });
    } else {
      this.moment({
        type: 'file:delete:files',
        description: `Deleted ${ container.utils.formatNumber(events.length) } files`,
        data: events.map((event) => event.data),
        icon: 'mdi-file-multiple',
      });
    }
  });
}

module.exports = function(container, options) {
  return new Timeline(container, options);
};
