'use strict';

const uuid = require('uuid/v4');
const Terminal = require('./terminal.js');

function Terminals (container) {
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
}

module.exports = function(container) {
  return new Terminals(container);
};
