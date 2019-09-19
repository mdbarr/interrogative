'use strict';

const uuid = require('uuid/v4');
const Terminal = require('./terminal.js');
const ActionSimple = require('./actionSimple.js');
const ActionInteractive = require('./actionInteractive.js');

function Terminals (container) {
  const index = new Map();

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

  for (const tab of tabs) {
    index.set(tab.id, tab);
  }

  //////////

  this.add = (tab) => {
    index.set(tab.id, tab);
    tabs.push(tab);
    return tab;
  };

  this.delete = (tab) => {
    index.delete(tab.id);
    tabs.splice(tabs.indexOf(tab), 1);
    return tab;
  };

  //////////

  this.emitList = () => {
    container.events.emit({
      type: 'terminal:tab:list',
      data: tabs
    });
  };

  this.open = () => {
    const tab = {
      id: uuid(),
      name: 'Terminal',
      type: 'terminal',
      icon: 'console',
      closeable: true
    };

    this.add(tab);

    container.events.emit({
      type: 'terminal:tab:opened',
      data: tab
    });

    container.events.emit({
      type: 'terminal:tab:focus',
      data: { id: tab.id }
    });
  };

  this.action = (event) => {
    const tab = {
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
      tab.args.push(container.files.focus);

      const filename = container.files.focus.replace(/^.*\/([^/]+)$/, '$1');
      tab.name += ` ${ filename }`;
    }

    this.add(tab);

    container.events.emit({
      type: 'terminal:tab:opened',
      data: tab
    });

    container.events.emit({
      type: 'terminal:tab:focus',
      data: { id: tab.id }
    });
  };

  this.close = (event) => {
    const id = event.data.id;
    if (index.has(id)) {
      const tab = index.get(id);

      this.delete(tab);

      if (tab.instance) {
        tab.instance.kill();
      }

      container.events.emit({
        type: 'terminal:tab:closed',
        data: tab
      });

      return true;
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

    const tab = index.get(id);

    if (tab.instance) {
      console.log('[terminal] attaching to existing instance', id);
      tab.instance.add(shed);

      return tab;
    }

    console.log('[terminal] creating new instance', id);
    container.utils.hidden(tab, 'instance', new Terminal(container, tab, {
      id,
      cols,
      rows,
      socket: shed
    }));

    return tab;
  };

  this.exec = (req, res, next) => {
    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = container.api.ws.accept(req, upgrade.socket, upgrade.head);

    const id = req.query.id;
    const tab = index.get(id);

    if (tab.instance) {
      console.log('[action] attaching to existing instance', id);
      console.pp(tab.instance);
      tab.instance.add(shed);
      console.log('[action] attached to', id);
      return tab;
    }

    console.log('[action] creating new instance', id, tab.type);

    if (tab.type === 'action-simple') {
      container.utils.hidden(tab, 'instance', new ActionInteractive(container, tab, {
        id,
        command: tab.command,
        args: tab.args,
        socket: shed
      }));
    } else {
      container.utils.hidden(tab, 'instance', new ActionSimple(container, tab, {
        id,
        command: tab.command,
        args: tab.args,
        socket: shed
      }));
    }

    this.add(tab);

    return tab;
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
