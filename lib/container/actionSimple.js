'use strict';

const uuid = require('uuid/v4');
const { spawn } = require('child_process');

function ActionSimple (container, {
  id, command, args, socket
}) {
  this.id = id || uuid();
  this.sockets = new Set();
 this.result = '';

  this.process = null;

  //////////

  this.spawn = () => {
    this.process = spawn(command, args, {
      cwd: process.env.HOME,
      env: {
        HOME: process.env.HOME,
        INTERROGATIVE: `v${ container.version }`,
        LANG: process.env.LANG,
        PATH: process.env.PATH,
        TERM: 'xterm-256color'
      },
      detached: false,
      shell: '/bin/bash'
    });

    this.process.stdout.on('data', (data) => {
      this.result += data.toString();
      for (const shed of this.sockets) {
        shed.send(data);
      }
    });

    this.process.stderr.on('data', (data) => {
      this.result += data.toString();
      for (const shed of this.sockets) {
        shed.send(data);
      }
    });
  };

  this.add = (shed) => {
    this.sockets.add(shed);

    shed.on('end', () => {
      this.delete(shed);
    });

    if (this.result) {
      shed.send(this.result);
    }
  };

  this.delete = (shed) => {
    this.sockets.delete(shed);
  };

  this.kill = () => {
    this.process.kill('SIGKILL');
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

module.exports = ActionSimple;
