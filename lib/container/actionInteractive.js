'use strict';

const pty = require('node-pty');
const uuid = require('uuid/v4');

function ActionInteractive (container, tab, {
  id, command, args, rows = 100, cols = 24, socket,
}) {
  this.id = id || uuid();
  this.sockets = new Set();

  this.shell = null;

  //////////

  this.spawn = () => {
    this.shell = pty.spawn(command, args, {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: {
        HOME: process.env.HOME,
        INTERROGATIVE: `v${ container.version }`,
        LANG: process.env.LANG,
        PATH: process.env.PATH,
      },
      cols,
      rows,
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
  };

  this.delete = (shed) => {
    this.sockets.delete(shed);
  };

  this.kill = () => {
    this.persistent = false;
    this.shell.kill('SIGKILL');
    for (const shed of this.sockets) {
      shed.end();
    }
  };

  //////////

  if (socket) {
    this.add(socket);
  }

  this.spawn();
}

module.exports = ActionInteractive;
