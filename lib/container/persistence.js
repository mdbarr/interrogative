'use strict';

const fs = require('fs');
const async = require('async');
const { join } = require('path');

function Persistence (container) {
  this.persist = {
    open: {
      path: join(container.config.container.persistence.directory, '/open.json'),
      data: null
    },
    chat: {
      path: join(container.config.container.persistence.directory, '/chat.json'),
      data: null
    },
    uploads: {
      path: join(container.config.container.persistence.directory, '/uploads.json'),
      data: null
    },
    timeline: {
      path: join(container.config.container.persistence.directory, '/timeline.json'),
      data: null
    }
  };

  //////////

  this.load = (item, callback) => {
    fs.readFile(item.path, (error, data) => {
      if (!error && data) {
        try {
          item.data = JSON.parse(data);
        } catch (error) {
          // no error
        }
      }
      callback(null);
    });
  };

  this.write = (item, callback) => {
    let data;

    try {
      data = JSON.stringify(item.data);
    } catch (error) {
      data = null;
    }

    if (data) {
      fs.writeFile(item.path, data, callback);
    } else {
      setImmediate(() => { callback(null); });
    }
  };

  //////////

  this.apply = (interview) => {
    if (Array.isArray(this.persist.open.data) && this.persist.open.data.length) {
      interview.open = this.persist.open.data;
    }

    if (Array.isArray(this.persist.chat.data) && this.persist.chat.data.length) {
      container.chat.messages = this.persist.chat.data;
    }

    if (this.persist.uploads.data && Object.keys(this.persist.uploads.data).length) {
      for (const path in this.persist.uploads.data) {
        container.files.uploads.set(path, this.persist.uploads.data[path]);
      }
    }

    if (Array.isArray(this.persist.timeline.data) && this.persist.timeline.data.length) {
      container.timeline.timeline = this.persist.timeline.data;
    }
  };

  this.save = (callback) => {
    callback = container.utils.callback(callback);

    this.persist.open.data = [];
    for (const [ path ] of container.files.files) {
      this.persist.open.data.push(path);
    }

    this.persist.chat.data = container.chat.messages;

    this.persist.uploads.data = {};
    for (const [ path, data ] of container.files.uploads) {
      this.persist.uploads.data[path] = data;
    }

    this.persist.timeline.data = container.timeline.timeline;

    async.each(this.persist, this.write, () => {
      console.log('[persistence] synced to disk');
      return callback(null);
    });
  };

  //////////

  this.start = (callback) => {
    fs.mkdir(container.config.container.persistence.directory, { recursive: true }, (error) => {
      async.each(this.persist, this.load, () => {
        this.interval = setInterval(this.save, container.config.container.persistence.interval);
        return callback(error);
      });
    });
  };
}

module.exports = function(container, options) {
  return new Persistence(container, options);
};
