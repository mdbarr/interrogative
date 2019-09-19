'use strict';

const uuid = require('uuid/v4');
const { spawn } = require('child_process');

function ActionSimple (container, tab, {
  id, command, args, socket
}) {
  this.id = id || uuid();
  this.sockets = new Set();
  this.process = null;

  this.done = false;

  this.replay = [];

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
      detached: true,
      shell: '/bin/bash'
    });

    this.process.stdout.on('data', (data) => {
      this.replay.push(data);

      for (const shed of this.sockets) {
        shed.send(data);
      }
    });

    this.process.stderr.on('data', (data) => {
      this.replay.push(data);

      for (const shed of this.sockets) {
        shed.send(data);
      }
    });

    this.process.on('exit', (code, signal) => {
      console.log(`[action] ${ id } exited with code ${ code }/${ signal }`);
      this.done = code;
      this.signal = signal;

      if (code === 0) {
        tab.color = 'green';
      } else {
        tab.color = 'red';
      }
      container.terminals.emitList();

      for (const shed of this.sockets) {
        shed.end();
      }
      this.sockets.clear();
    });
  };

  this.add = (shed) => {
    if (this.done === false) {
      this.sockets.add(shed);

      shed.on('end', () => {
        this.delete(shed);
      });
    }

    console.log(`[action] replaying ${ this.replay.length } events for attached instance`);
    for (const data of this.replay) {
      shed.send(data);
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
    this.sockets.clear();
  };

  //////////

  if (socket) {
    this.add(socket);
  }

  this.spawn();
}

module.exports = ActionSimple;
