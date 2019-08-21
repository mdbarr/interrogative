'use strict';

const path = require('path');
const chokidar = require('chokidar');
const Griff = require('@mdbarr/griff');
const { debounce } = require('barrkeep/utils');

function Git (container, options) {
  const griff = new Griff({
    repository: options.repository,
    limit: options.limit || 100,
    background: '#424242',
    text: true
  });

  const directory = path.join(options.repository, '/.git');
  let cached = '';

  this.render = (useCache = true) => {
    if (useCache && cached) {
      container.events.emit({
        type: 'git:repository:svg',
        data: cached
      });
    } else {
      griff.generate().then((svg) => {
        cached = svg;
        container.events.emit({
          type: 'git:repository:svg',
          data: cached
        });
      });
    }
  };

  const onAll = debounce(() => {
    this.render(false);
  }, 500);

  this.watch = () => {
    console.log('*generating git watcher:', directory);

    this.watcher = chokidar.watch(directory, {
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('all', onAll);
  };

  this.start = () => {
    if (options.enabled) {
      this.watch();

      this.render(false);

      container.events.on('connected', () => {
        this.render();
      });
    }
  };
}

module.exports = (container, options) => {
  return new Git(container, options);
};
