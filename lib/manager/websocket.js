'use strict';

const http = require('http');
const errors = require('restify-errors');
const Watershed = require('watershed').Watershed;

function Websocket (manager) {
  const ws = new Watershed();

  this.wire = (a, b) => {
    a.on('end', (code, reason) => {
      console.log('[ws] ended', code, reason);
      b.end(reason);
    });

    a.on('text', (data) => {
      try {
        b.send(data);
      } catch (error) {
        // No error
      }
    });

    a.on('binary', (data) => {
      try {
        b.send(data);
      } catch (error) {
        // No error
      }
    });
  };

  this.connect = (address, port, path, callback) => {
    console.log('[ws] connecting to port', port);
    const wskey = ws.generateKey();

    const options = {
      method: 'GET',
      host: address,
      port,
      path,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': wskey,
        'Sec-WebSocket-Version': '13'
      }
    };

    const req = http.request(options);
    req.end();

    console.log('[ws] connection initiated');

    req.on('error', (error) => {
      console.log('[ws] error', error.message);
      callback(error);
    });

    req.on('upgrade', (res, socket, head) => {
      console.log('[ws] container upgrade');
      const wsc = ws.connect(res, socket, head, wskey);
      console.log('[ws] container connected');

      callback(null, wsc);
    });
  };

  this.attach = (req, res, next) => {
    const interview = manager.interviews.lookup(req.params.id);
    if (!interview) {
      return next(new errors.NotFoundError(`Interview ${ req.params.id } not found`));
    }

    console.log('[ws] starting');
    if (!res.claimUpgrade) {
      return next(new Error('Connection Must Upgrade For WebSockets'));
    }

    console.log('[ws] connecting to container');

    let path = req.path();
    if (req.getQuery()) {
      path += `?${ req.getQuery() }`;
    }

    return this.connect(interview.state.container.address,
      manager.config.container.port, path, (error, proxy) => {
        if (error) {
          console.log('[ws] unable to proxy websocket');
          return next(new errors.InternalServerError('Unable to proxy websocket'));
        }

        const upgrade = res.claimUpgrade();
        const shed = ws.accept(req, upgrade.socket, upgrade.head);

        console.log('[ws] client accepted');

        console.log('[ws] wiring proxy...');

        this.wire(shed, proxy);
        this.wire(proxy, shed);

        return next(false);
      });
  };
}

module.exports = function (manager) {
  return new Websocket(manager);
};
