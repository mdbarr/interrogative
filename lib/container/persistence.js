'use strict';

const fs = require('fs');
const { join } = require('path');

function Persistence (container) {
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

  this.load = (name, path, callback) => {
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

  this.write = (path, data, callback) => {
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
    this.data.uploads = {};

    for (const [ path, data ] of container.files.uploads) {
      this.data.uploads[path] = data;
    }

    this.write(this.files.open, this.data.open, () => {
      this.write(this.files.uploads, this.data.uploads, () => {
        this.write(this.files.timeline, this.data.timeline, () => {
          console.log('[persistence] synced to disk');
          return callback(null);
        });
      });
    });
  };

  //////////

  this.start = (callback) => {
    fs.mkdir(container.config.container.persistence.directory, { recursive: true }, (error) => {
      this.load('open', this.files.open, () => {
        this.load('uploads', this.files.uploads, () => {
          this.load('timeline', this.files.timeline, () => {
            this.interval = setInterval(this.save, container.config.container.persistence.interval);

            return callback(error);
          });
        });
      });
    });
  };
}

module.exports = function(container, options) {
  return new Persistence(container, options);
};
