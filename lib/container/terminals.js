'use strict';

const uuid = require('uuid/v4');
const Terminal = require('./terminal.js');
const ActionSimple = require('./actionSimple.js');
const ActionInteractive = require('./actionInteractive.js');

function Terminals (container) {
  const index = new Map();
  const terminals = new Map();

  const tabs = [ {
    id: uuid(),
    name: 'Terminal',
    type: 'terminal',
    icon: 'console',
    closeable: false
  }, {
    id: uuid(),
    name: 'Chat',
    type: 'chat',
    icon: 'forum',
    closeable: false
  } ];

  this.focus = tabs[0].id;

  //////////

  this.emitList = () => {
    container.events.emit({
      type: 'terminal:tab:list',
      data: tabs
    });
  };

  this.open = () => {
    const terminal = {
      id: uuid(),
      name: 'Terminal',
      type: 'terminal',
      icon: 'console',
      closeable: true
    };

    index.set(terminal.id, terminal);
    tabs.push(terminal);

    container.events.emit({
      type: 'terminal:tab:opened',
      data: terminal
    });

    container.events.emit({
      type: 'terminal:tab:focus',
      data: { id: terminal.id }
    });
  };

  this.action = (event) => {
    const action = {
      id: uuid(),
      name: event.data.name,
      type: `action-${ event.data.type }`,
      icon: 'play-circle-outline',
      color: '#0087ad',
      closeable: true,
      command: event.data.command,
      args: []
    };

    if (event.data.scope === 'tab') {
      action.args.push(container.files.focus);

      const filename = container.files.focus.replace(/^.*\/([^/]+)$/, '$1');
      action.name += ` ${ filename }`;
    }

    index.set(action.id, action);
    tabs.push(action);

    container.events.emit({
      type: 'terminal:tab:opened',
      data: action
    });

    container.events.emit({
      type: 'terminal:tab:focus',
      data: { id: action.id }
    });
  };

  this.close = (event) => {
    const id = event.data.id;
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      if (tab.id === id && tab.closeable) {
        tabs.splice(i, 1);

        if (tab.type === 'terminal' && terminals.has(id)) {
          const terminal = terminals.get(id);
          terminals.delete(id);
          terminal.kill();
        }

        container.events.emit({
          type: 'terminal:tab:closed',
          data: tab
        });

        return true;
      }
    }
    return false;
  };

  //////////

  this.shell = (req, res, next) => {
    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = container.api.ws.accept(req, upgrade.socket, upgrade.head);

    const id = req.query.id;
    const cols = Number(req.query.cols) || 100;
    const rows = Number(req.query.rows) || 24;

    console.log('[terminal]', id, cols, rows);

    if (terminals.has(id)) {
      console.log('[terminal] attaching to existing instance', id);
      const terminal = terminals.get(id);
      terminal.add(shed);

      return terminal;
    }

    console.log('[terminal] creating new instance', id);
    const terminal = new Terminal(container, {
      id,
      cols,
      rows,
      socket: shed
    });

    terminals.set(id, terminal);

    return terminal;
  };

  this.exec = (req, res, next) => {
    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = container.api.ws.accept(req, upgrade.socket, upgrade.head);

    const id = req.query.id;
    console.log('[action]', id);

    if (terminals.has(id)) {
      console.log('[action] attaching to existing instance', id);
      const terminal = terminals.get(id);
      terminal.add(shed);

      return terminal;
    }

    console.log('[action] creating new instance', id);

    const action = index.get(id);
    let terminal;

    if (!action) {
      return false;
    } else if (action.type === 'action-simple') {
      terminal = new ActionInteractive(container, {
        id,
        ...action,
        socket: shed
      });
    } else {
      terminal = new ActionSimple(container, {
        id,
        ...action,
        socket: shed
      });
    }
    terminals.set(id, terminal);

    return terminal;
  };

  //////////

  container.events.on('connected', () => {
    this.emitList();

    if (this.focus) {
      container.events.emit({
        type: 'terminal:tab:focus',
        data: { id: this.focus }
      });
    }
  });

  container.events.on('terminal:tab:focus', (event) => {
    this.focus = event.data.id;
  });

  container.events.on('terminal:tab:open', this.open);

  container.events.on('terminal:tab:close', this.close);

  container.events.on('action:tab:open', this.action);
}

module.exports = function(container) {
  return new Terminals(container);
};
