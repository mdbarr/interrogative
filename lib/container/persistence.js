'use strict';

const fs = require('fs');
const async = require('async');
const { join } = require('path');

function Persistence (container) {
  this.parts = [ 'open', 'uploads', 'timeline' ];

  this.files = {
    open: join(container.config.container.persistence.directory, '/open.json'),
    uploads: join(container.config.container.persistence.directory, '/uploads.json'),
    timeline: join(container.config.container.persistence.directory, '/timeline.json')
  };

  this.data = {
    open: null,
    uploads: null,
    timeline: null
  };

  //////////

  this.load = (name, callback) => {
    const path = this.files[name];

    fs.readFile(path, (error, data) => {
      if (!error && data) {
        try {
          this.data[name] = JSON.parse(data);
        } catch (error) {
          // no error
        }
      }
      callback(null);
    });
  };

  this.write = (name, callback) => {
    const path = this.files[name];
    let data = this.data[name];

    try {
      data = JSON.stringify(data);
    } catch (error) {
      data = null;
    }

    if (data) {
      fs.writeFile(path, data, callback);
    } else {
      setImmediate(() => { callback(null); });
    }
  };

  //////////

  this.apply = (interview) => {
    if (Array.isArray(this.data.open) && this.data.open.length) {
      interview.open = this.data.open;
    }

    if (this.data.uploads && Object.keys(this.data.uploads).length) {
      for (const path in this.data.uploads) {
        container.files.uploads.set(path, this.data.uploads[path]);
      }
    }

    if (Array.isArray(this.data.timeline) && this.data.timeline.length) {
      container.timeline.timeline = this.data.timeline;
    }
  };

  this.save = (callback) => {
    callback = container.utils.callback(callback);

    this.data.open = [];
    for (const [ path ] of container.files.files) {
      this.data.open.push(path);
    }

    this.data.uploads = {};
    for (const [ path, data ] of container.files.uploads) {
      this.data.uploads[path] = data;
    }

    this.data.timeline = container.timeline.timeline;

    async.each(this.parts, this.write, () => {
      console.log('[persistence] synced to disk');
      return callback(null);
    });
  };

  //////////

  this.start = (callback) => {
    fs.mkdir(container.config.container.persistence.directory, { recursive: true }, (error) => {
      async.each(this.parts, this.load, () => {
        this.interval = setInterval(this.save, container.config.container.persistence.interval);
        return callback(error);
      });
    });
  };
}

module.exports = function(container, options) {
  return new Persistence(container, options);
};
