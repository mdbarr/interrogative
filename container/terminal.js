'use strict';

const pty = require('node-pty');
const uuid = require('uuid/v4');

function Terminal (container, {
  instance, rows = 100, cols = 24, persistent = true, socket
}) {
  this.id = uuid();
  this.instance = instance;
  this.persistent = persistent;
  this.sockets = new Set();

  this.shell = null;

  this.spawn = () => {
    this.shell = pty.spawn('/bin/bash', [ ], {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: {
        HOME: process.env.HOME,
        INTERROGATIVE: `v${ container.version }`,
        LANG: process.env.LANG,
        PATH: process.env.PATH,
        USER: process.env.USER
      },
      cols,
      rows
    });

    this.shell.on('data', (data) => {
      for (const shed of this.sockets) {
        shed.send(data);
      }
    });

    this.shell.on('close', () => {
      if (this.persistent) {
        this.spawn();
      }
    });
  };

  this.add = (shed) => {
    this.sockets.add(shed);

    shed.on('text', (data) => {
      if (data !== 'PING' && this.shell) {
        this.shell.write(data);
      }
    });

    shed.on('end', () => {
      this.delete(shed);
    });

    if (this.shell) {
      this.shell.write('');
    }
  };

  this.delete = (shed) => {
    this.sockets.delete(shed);
  };

  if (socket) {
    this.add(socket);
  }

  this.spawn();
}

module.exports = Terminal;
