'use strict';

const { v4: uuid } = require('uuid');
const Terminal = require('./terminal');
const ActionSimple = require('./actionSimple');
const ActionInteractive = require('./actionInteractive');

function Terminals (container) {
  const index = new Map();

  const tabs = [ {
    id: uuid(),
    name: 'Terminal',
    type: 'terminal',
    icon: 'console',
    closeable: false,
  }, {
    id: uuid(),
    name: 'Chat',
    type: 'chat',
    icon: 'forum',
    closeable: false,
  } ];

  this.focus = tabs[0].id;
  this.cols = 100;
  this.rows = 24;

  for (const tab of tabs) {
    index.set(tab.id, tab);
  }

  //////////

  this.emitList = () => {
    container.events.emit({
      type: 'terminal:tab:list',
      data: tabs,
    });
  };

  this.open = (event) => {
    let tab;
    if (!event.data || event.data.type === 'terminal') {
      tab = {
        id: uuid(),
        name: 'Terminal',
        type: 'terminal',
        icon: 'console',
        closeable: true,
      };
    } else {
      tab = {
        id: uuid(),
        name: event.data.name,
        type: `action-${ event.data.type }`,
        icon: 'play-circle-outline',
        color: '#0087af',
        closeable: true,
        command: event.data.command,
        args: [],
      };

      if (event.data.scope === 'tab') {
        tab.args.push(container.files.focus);

        const filename = container.files.focus.replace(/^.*\/([^/]+)$/, '$1');
        tab.name = filename;
      }
    }

    index.set(tab.id, tab);
    tabs.push(tab);

    container.events.emit({
      type: 'terminal:tab:opened',
      data: tab,
    });

    container.events.emit({
      type: 'terminal:tab:focus',
      data: { id: tab.id },
    });
  };

  this.close = (event) => {
    const id = event.data.id;
    if (index.has(id)) {
      const tab = index.get(id);

      index.delete(tab.id);
      tabs.splice(tabs.indexOf(tab), 1);

      if (tab.instance) {
        tab.instance.kill();
      }

      container.events.emit({
        type: 'terminal:tab:closed',
        data: tab,
      });

      return true;
    }
    return false;
  };

  //////////

  this.terminal = (req, res, next) => {
    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    const upgrade = res.claimUpgrade();
    const shed = container.api.ws.accept(req, upgrade.socket, upgrade.head);

    const id = req.query.id;

    const tab = index.get(id);

    if (tab.instance) {
      console.log(`[${ tab.type }] attaching to existing instance ${ tab.id }`);
      tab.instance.add(shed);

      return tab;
    }

    console.log(`[${ tab.type }] creating new instance ${ id }`);
    if (tab.type === 'terminal') {
      container.utils.hidden(tab, 'instance', new Terminal(container, tab, {
        id,
        cols: this.cols,
        rows: this.rows,
        socket: shed,
      }));
    } else if (tab.type === 'action-simple') {
      container.utils.hidden(tab, 'instance', new ActionSimple(container, tab, {
        id,
        command: tab.command,
        args: tab.args,
        socket: shed,
      }));
    } else {
      container.utils.hidden(tab, 'instance', new ActionInteractive(container, tab, {
        id,
        command: tab.command,
        args: tab.args,
        socket: shed,
      }));
    }

    return next(false);
  };

  //////////

  container.events.on('connected', () => {
    this.emitList();

    if (this.focus) {
      container.events.emit({
        type: 'terminal:tab:focus',
        data: { id: this.focus },
      });
    }
  });

  container.events.on('terminal:tab:focus', (event) => {
    this.focus = event.data.id;
  });

  container.events.on('terminal:tab:open', this.open);
  container.events.on('terminal:tab:close', this.close);

  container.events.on('terminal:window:size', (event) => {
    console.log('terminal size event', event.data);

    if (event.data.cols > 0 && event.data.rows > 0) {
      if (container.managementApi.connections.size === 1) {
        this.cols = event.data.cols;
        this.rows = event.data.rows;
      } else {
        this.cols = Math.min(this.cols, event.data.cols);
        this.rows = Math.min(this.rows, event.data.rows);
      }

      for (const tab of tabs) {
        if (tab.type === 'terminal' && tab.instance) {
          tab.instance.resize(this.cols, this.rows);
        }
      }

      console.log('terminal size computed', this.cols, this.rows);
    }
  });
}

module.exports = function(container) {
  return new Terminals(container);
};
