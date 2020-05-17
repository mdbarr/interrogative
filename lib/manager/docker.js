'use strict';

const os = require('os');
const Engine = require('dockerode');
const CIDRMatcher = require('cidr-matcher');

function Docker (manager) {
  this.engine = new Engine(manager.config.manager.engine);
  this.containers = new Map();
  this.networks = {};

  console.log(`${ manager.config.name } Docker Engine connected`);

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
            data: event,
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
          interview.$save(() => {
            console.log('[manager] ended interview', interview.id);
          });
        }
        return id;
      });
    }
    return false;
  });

  //////////

  this.boot = (interview, callback) => {
    this.engine.createContainer({
      Image: interview.image,
      Tty: false,
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: false,
      Env: [ `INTERVIEW_ID=${ interview.id }` ],
      ExposedPorts: { [`${ manager.config.container.port }/tcp`]: {} },
      HostConfig: {
        AutoRemove: process.env.INTERROGATIVE_AUTO_REMOVE === 'true',
        Binds: [
          `${ interview.volume }:${ interview.home }`,
          '/etc/timezone:/etc/timezone:ro',
          '/etc/localtime:/etc/localtime:ro',
        ],
        NetworkMode: this.networks.container.Name,
        ExtraHosts: [ `manager:${ this.networks.container.address }` ],
      },
    }).
      then((container) => container.start().
        then(() => container.inspect()).
        then((data) => {
          interview.state.container.id = data.Id;
          interview.state.container.address = manager.utils.resolve(data,
            `NetworkSettings.Networks.${ this.networks.container.Name }.IPAddress`);
          interview.state.container.running = data.State.Running;
          this.containers.set(data.Id, interview.id);
          return interview.$save((error) => {
            if (error) {
              return callback(error);
            }
            return callback(null, interview);
          });
        })).
      catch((error) => {
        callback(error);
      });
  };

  //////////

  this.start = (callback) => this.engine.listNetworks().
    then((networks) => {
      for (const network of networks) {
        for (const name in manager.config.manager.networks) {
          if (network.Name === manager.config.manager.networks[name]) {
            const cidr = manager.utils.resolve(network, 'IPAM.Config[0].Subnet');
            manager.utils.hidden(network, 'matcher', new CIDRMatcher([ cidr ]));
            this.networks[name] = network;
          }
        }
      }

      const adapters = os.networkInterfaces();
      for (const adapter in adapters) {
        const interfaces = adapters[adapter];

        for (const configuration of interfaces) {
          if (configuration.family === 'IPv4' && configuration.internal === false) {
            for (const name in this.networks) {
              if (this.networks[name].matcher.contains(configuration.address)) {
                this.networks[name].address = configuration.address;
              }
            }
          }
        }
      }

      console.pp(this.networks);

      return callback(null);
    }).
    catch((error) => callback(error));
}

module.exports = function(manager) {
  return new Docker(manager);
};
