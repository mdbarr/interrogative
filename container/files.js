'use strict';

const fs = require('fs');
const dree = require('dree');
const mime = require('mime');
const { merge } = require('barrkeep/utils');

const defaults = {
  stat: false,
  normalize: true,
  followLinks: true,
  size: true,
  hash: true,
  exclude: /(node_modules|\.git)/
};

function Files (container, directory, options = {}) {
  this.config = merge(defaults, options, true);

  this.tree = {};

  this.files = new Map();

  this.open = (path) => {
    if (this.files.has(path)) {
      container.events.emit({
        type: 'files:file:opened',
        data: this.files.get(path)
      });
    } else {
      const name = path.replace(/^.*\/([^/]+)$/, '$1');
      const extension = name.replace(/^[^.]+/, '$1');

      const model = {
        name,
        path,
        extension,
        type: 'file',
        icon: 'file',
        closeable: true,
        mime: null,
        contents: null,
        stat: null
      };

      fs.stat(path, (error, stat) => {
        if (error) {
          container.events.emit({
            type: 'error',
            data: error
          });
        } else {
          model.stat = stat;

          model.mime = mime.getType(model.extension) || 'text/plain';

          fs.readFile(path, (error, data) => {
            if (error) {
              container.events.emit({
                type: 'error',
                data: error
              });
            } else {
              model.contents = data.toString();

              this.files.set(path, model);

              container.events.emit({
                type: 'files:file:opened',
                data: model
              });
            }
          });
        }
      });
    }
  };

  this.scan = () => {
    this.tree = dree.scan(directory, this.config, (element) => {
      element.mime = mime.getType(element.extension) || 'text/plain';
      // extra: text/x-csrc, text/x-c++src, text/x-java,
      //        text/x-cmake, text/x-scss, text/x-dockerfile,
      //        text/x-groovy, text/x-haskell, text/x-lua,
      //        markdown, text/x-perl, text/x-php, text/x-python
      //        text/x-rst, text/x-ruby, text/x-sh, text/x-vue
      //        text/x-yaml, text/x-java, text/x-scala, text/x-diff
      //        text/html, application/xml
    });

    container.events.emit({
      type: 'files:tree:update',
      data: this.tree
    });

    return this.tree;
  };

  container.events.on('files:file:open', (event) => {
    console.log('open request', event.data);
    this.open(event.data.path);
  });

  this.start = () => {
    this.scan();

    this.watcher = fs.watch(directory, {
      persistent: true,
      recursive: true
    });

    this.watcher.on('change', (type) => {
      if (type === 'rename') {
        this.scan();
      }
    });
  };
}

module.exports = (directory, options) => {
  return new Files(directory, options);
};
