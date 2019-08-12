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

  this.scan = () => {
    this.tree = dree.scan(directory, this.config, (element) => {
      element.mime = mime.getType(element.extension);
    });

    container.events.emit('message', {
      type: 'file-tree',
      data: this.tree
    });

    return this.tree;
  };

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
