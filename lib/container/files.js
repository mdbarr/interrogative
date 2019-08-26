'use strict';

const fs = require('fs');
const dree = require('dree');
const mime = require('mime');
const { join } = require('path');
const chokidar = require('chokidar');
const {
  debounce, merge
} = require('barrkeep/utils');

const defaults = {
  stat: false,
  normalize: true,
  followLinks: true,
  size: true,
  hash: true,
  exclude: /(node_modules|\.git$)/
};

function Files (container, options = {}) {
  this.config = merge(defaults, options, true);

  this.tree = {};
  this.paths = new Set();

  this.files = new Map();

  this.focus = '';

  //////////

  this.read = (model, callback) => {
    return fs.readFile(model.path, (error, data) => {
      if (error) {
        container.events.emit({
          type: 'error',
          data: error
        });
        return error;
      }
      model.binary = false;

      for (let i = 0; i < data.length; i++) {
        if (data[i] > 127) {
          model.binary = true;
          break;
        }
      }

      if (model.binary) {
        model.contents = data.toString('hex');
      } else {
        model.contents = data.toString();
      }

      return callback(model);
    });
  };

  this.update = (model) => {
    this.read(model, () => {
      container.events.emit({
        type: 'files:file:updated',
        data: model
      });
    });
  };

  this.open = (path) => {
    if (this.files.has(path)) {
      container.events.emit({
        type: 'files:file:opened',
        data: this.files.get(path)
      });
    } else {
      const name = path.replace(/^.*\/([^/]+)$/, '$1');
      const extension = name.replace(/^([^.]+\.)/, '');

      const model = {
        name,
        path,
        extension,
        type: null,
        closeable: true,
        contents: null,
        stat: null,
        focus: true,
        saving: false
      };

      fs.stat(path, (error, stat) => {
        if (error) {
          container.events.emit({
            type: 'error',
            data: error
          });
        } else {
          model.stat = stat;
          if (stat.isBlockDevice()) {
            model.type = 'block-device';
          } else if (stat.isCharacterDevice()) {
            model.type = 'character-device';
          } else if (stat.isDirectory()) {
            model.type = 'directory';
          } else if (stat.isFIFO()) {
            model.type = 'fifo';
          } else if (stat.isFile()) {
            model.type = 'file';
          } else if (stat.isSocket()) {
            model.type = 'socket';
          }

          this.setAttributes(model);

          this.read(model, () => {
            Object.defineProperty(model, 'save', {
              value: debounce(() => {
                console.log('*saving', model.path);
                model.saving = true;
                fs.writeFile(model.path, model.contents, () => {
                  // ensure no more processing
                  process.nextTick(() => {
                    model.saving = false;
                  });
                });
              }, 500),
              enumerable: false,
              writable: false,
              configurable: false
            });

            this.files.set(path, model);

            container.events.emit({
              type: 'files:file:opened',
              data: model
            });
          });
        }
      });
    }
  };

  this.setAttributes = (item) => {
    item.mime = mime.getType(item.extension);
    item.color = 'white';
    item.icon = 'file';

    if (item.name === 'Dockerfile') { // names
      item.mime = 'text/x-dockerfile';
      item.color = '#3A8CB4';
      item.icon = 'docker';
    } else if (item.name === 'CMakeLists.txt') {
      item.mime = 'text/x-cmake';
      item.color = '#649AD2';
      item.icon = 'language-c';
    } else if (item.name === 'package.json') {
      item.mime = 'application/json';
      item.color = '#F53E44';
      item.icon = 'npm-variant-outline';
    } else if (item.name === 'yarn.lock') {
      item.mime = 'text/plain';
      item.color = '#89BB5A';
      item.icon = 'nodejs';
    } else if (item.name === '.browserslistrc') {
      item.mime = 'text/plain';
      item.icon = 'web-box';
    } else if (item.name === '.editorconfig') {
      item.mime = 'text/plain';
      item.icon = 'pencil-box';
    } else if (item.name === '.gitignore') {
      item.mime = 'text/plain';
      item.color = '#F54D27';
      item.icon = 'git';
    } else if (item.name.startsWith('.bash')) {
      item.mime = 'text/x-sh';
      item.icon = 'file-code';
    } else if (item.extension === 'c' || item.extension === 'h') { // extensions
      item.mime = 'text/x-csrc';
      item.icon = 'langauge-c';
      item.color = '#649AD2';
    } else if (item.extension === 'cpp' || item.extension === 'hpp') {
      item.mime = 'text/x-csrc';
      item.icon = 'language-cpp';
      item.color = '#649AD2';
    } else if (item.extension === 'css') {
      item.mime = 'text/x-css';
      item.color = '#2673BA';
      item.icon = 'language-css3';
    } else if (item.extension === 'diff' || item.extension === 'patch') {
      item.mime = 'text/x-diff';
      item.icon = 'vector-difference';
    } else if (item.extension === 'groovy') {
      item.mime = 'text/x-groovy';
      item.color = '#5382A1';
      item.icon = 'language-java';
    } else if (item.extension === 'hs' || item.extension === 'lhs') {
      item.mime = 'text/x-haskell';
      item.color = '#649AD2';
      item.icon = 'language-haskell';
    } else if (item.extension === 'html' || item.extension === 'htm') {
      item.mime = 'text/html';
      item.color = '#E44D26';
      item.icon = 'language-html5';
    } else if (item.extension === 'java') {
      item.mime = 'text/x-java';
      item.color = '#5382A1';
      item.icon = 'language-java';
    } else if (item.extension === 'js') {
      item.mime = 'text/javascript';
      item.color = '#F0DB4F';
      item.icon = 'language-javascript';
    } else if (item.extension === 'json') {
      item.mime = 'application/json';
      item.icon = 'json';
    } else if (item.extension === 'md') {
      item.mime = 'text/x-markdown';
      item.color = '#9927E5';
      item.icon = 'markdown';
    } else if (item.extension === 'pdf') {
      item.color = '#DB1B23';
      item.icon = 'file-pdf';
    } else if (item.extension === 'pl' || item.extension === 'pm') {
      item.mime = 'text/x-perl';
      item.icon = 'file-code';
    } else if (item.extension === 'php') {
      item.mime = 'text/x-php';
      item.icon = 'language-php';
    } else if (item.extension === 'py') {
      item.mime = 'text/x-python';
      item.color = '#3674A5';
      item.icon = 'language-python';
    } else if (item.extension === 'rst') {
      item.mime = 'text/x-rst';
      item.icon = 'file-document';
    } else if (item.extension === 'rb') {
      item.mime = 'text/x-ruby';
    } else if (item.extension === 'sc' || item.extension === 'scala') {
      item.mime = 'text/x-scala';
      item.icon = 'file-code';
    } else if (item.extension === 'scss') {
      item.mime = 'text/x-scss';
      item.color = '#2673BA';
      item.icon = 'language-css3';
    } else if (item.extension === 'sh' || item.extension === 'bash') {
      item.mime = 'text/x-sh';
      item.icon = 'file-code';
    } else if (item.extension === 'ts') {
      item.mime = 'text/typescript';
      item.color = '#2A7ACC';
      item.icon = 'language-typescript';
    } else if (item.extension === 'vue') {
      item.mime = 'text/x-vue';
      item.color = '#41B883';
      item.icon = 'vuejs';
    } else if (item.extenision === 'yml' || item.extension === 'yaml') {
      item.mime = 'text/x-yaml';
      item.icon = 'file-code';
    } else if (item.extension === 'xml') {
      item.mime = 'application/xml';
      item.icon = 'file-code';
    } else if (item.extension === 'gif') {
      item.icon = 'gif';
    } else if ([ 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png' ].includes(item.extension)) {
      item.icon = 'file-image';
    } else if ([ 'eot', 'otf', 'ttf', 'woff', 'woff2' ].includes(item.extension)) {
      item.icon = 'format-font';
    }

    if (item.name.includes('eslint')) { // special cases
      item.color = '#8080F2';
      item.icon = 'eslint';
    } else if (item.name.endsWith('.js.map')) {
      item.mime = 'text/javascript';
      item.color = '#F0DB4F';
      item.icon = 'language-javascript';
    }

    item.icon = `mdi-${ item.icon }`;
  };

  this.watch = () => {
    console.log('*generating watcher:', container.interview.home);

    this.watcher = chokidar.watch(container.interview.home, {
      persistent: true,
      ignoreInitial: true,
      ignored: this.config.exclude
    });

    this.watcher.on('all', (type, filename) => {
      console.log('=watch', type, filename);
      if (type === 'change') {
        if (this.files.has(filename)) {
          console.log('*ext-change', filename);
          const file = this.files.get(filename);
          if (!file.saving) {
            this.update(file);
          }
        }
      } else {
        if (type === 'unlink') {
          if (this.files.has(filename)) {
            container.events.emit({
              type: 'files:file:closed',
              data: { path: filename }
            });
          }
        }

        this.scan();
        this.emitTree();
      }
    });
  };

  this.sort = (item) => {
    if (item.type === 'directory' && item.children) {
      item.children.sort((a, b) => {
        if (a.type < b.type) {
          return -1;
        } else if (a.type > b.type) {
          return 1;
        } else if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      for (const child of item.children) {
        this.sort(child);
      }
    }
  };

  this.scan = () => {
    this.paths = new Set();

    this.tree = dree.scan(container.interview.home, this.config, (element) => {
      this.setAttributes(element);
      this.paths.add(element.path);
    }, (element) => {
      this.paths.add(element.path);
    });

    this.sort(this.tree);

    return this.tree;
  };

  //////////

  this.emitTree = () => {
    container.events.emit({
      type: 'files:tree:update',
      data: this.tree
    });
  };

  this.emitFiles = () => {
    for (const [ , file ] of this.files) {
      container.events.emit({
        type: 'files:file:opened',
        data: {
          ...file,
          focus: false
        }
      });
    }
  };

  container.events.on('files:file:open', (event) => {
    console.log('open request', event.data);
    this.open(event.data.path);
  });

  container.events.on('editor:tab:focus', (event) => {
    this.focus = event.data.path;
  });

  container.events.on('files:file:closed', (event) => {
    if (this.files.has(event.data.path)) {
      this.files.delete(event.data.path);
    }
  });

  container.events.on('editor:document:change', (event) => {
    if (this.files.has(event.data.path)) {
      const file = this.files.get(event.data.path);
      file.contents = event.data.contents;
      console.log('*update', event.data.path, file.contents.length);
      file.save();
    }
  });

  container.events.on('connected', () => {
    this.emitTree();

    this.emitFiles();

    if (this.focus) {
      container.events.emit({
        type: 'editor:tab:focus',
        data: { path: this.focus }
      });
    }
  });

  //////////

  this.start = () => {
    for (let path of container.interview.open) {
      if (!path.includes('/')) {
        path = join(container.interview.home, path);
      }
      this.open(path);
      if (!this.focus) {
        this.focus = path;
      }
    }

    this.scan();

    this.watch();
  };
}

module.exports = (container, directory, options) => {
  return new Files(container, directory, options);
};
