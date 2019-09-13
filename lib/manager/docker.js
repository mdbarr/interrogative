'use strict';

const os = require('os');
const Engine = require('dockerode');
const { resolve } = require('barrkeep/utils');

function Docker (manager) {
  this.engine = new Engine(manager.config.manager.engine);
  this.containers = new Map();

  console.log(`${ manager.config.name } Docker Engine connected (${ this.ip() })`);

  //////////

  this.engine.getEvents((error, stream) => {
    if (error) {
      console.log('[manager] error subscribing to docker engine events');
    } else {
      stream.on('data', (data) => {
        let event;

        try {
          event = JSON.parse(data);
        } catch (error) {
          console.log('[manager] error parsing docker engine event', error);
        }

        if (event) {
          manager.events.emit({
            type: `docker:${ event.Type }:${ event.Action }`,
            data: event
          });
        }
      });
    }
  });

  //////////

  manager.events.on('docker:container:(kill|stop|die)', (event) => {
    if (this.containers.has(event.data.id)) {
      const id = this.containers.get(event.data.id);
      return manager.interviews.lookup(id, (error, interview) => {
        if (!error && interview) {
          interview.state.container.id = null;
          interview.state.container.address = null;
          interview.state.container.starting = false;
          interview.state.container.ready = false;
          this.containers.delete(event.data.id);
          interview.update();
          console.log('[manager] ended interview', interview.id);
        }
        return id;
      });
    }
    return false;
  });

  //////////

  this.boot = (model, callback) => {
    this.engine.createContainer({
      Image: model.image,
      Tty: false,
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: false,
      Env: [
        `INTERVIEW_ID=${ model.id }`
      ],
      ExposedPorts: { [`${ manager.config.container.port }/tcp`]: {} },
      HostConfig: {
        AutoRemove: false,
        Binds: [
          `${ model.volume }:${ model.home }`,
          '/etc/timezone:/etc/timezone:ro',
          '/etc/localtime:/etc/localtime:ro'
        ],
        NetworkMode: 'interrogative',
        ExtraHosts: [
          `manager:${ this.ip() }`
        ]
      }
    }).
      then((container) => {
        return container.start().
          then(() => {
            return container.inspect();
          }).
          then((data) => {
            model.state.container.id = data.Id;
            model.state.container.address = resolve(data,
              'NetworkSettings.Networks.interrogative.IPAddress');
            model.state.container.running = data.State.Running;
            this.containers.set(data.Id, model.id);
            return model.save((error) => {
              if (error) {
                return callback(error);
              }
              return callback(null, model);
            });
          });
      }).
      catch((error) => {
        callback(error);
      });
  };
}

Docker.prototype.ip = function() {
  if (!this.address) {
    const adapters = os.networkInterfaces();
    for (const adapter in adapters) {
      const interfaces = adapters[adapter];

      for (const configuration of interfaces) {
        if (configuration.family === 'IPv4' && configuration.internal === false) {
          this.address = configuration.address;
          return this.address;
        }
      }
    }
  }
  return this.address;
};

module.exports = function(manager) {
  return new Docker(manager);
};
