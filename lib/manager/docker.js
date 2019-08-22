'use strict';

const os = require('os');
const Engine = require('dockerode');

function Docker(manager) {
  this.engine = new Engine(manager.config.manager.engine);
  console.log(`${ manager.config.name } Docker Engine connected (${ this.ip() })`);

  this.boot = (model, callback) => {
    this.engine.createContainer({
      Image: model.image,
      Tty: false,
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: false,
      Env: [
        `MANAGER_IP=${ this.ip() }`,
        `INTERVIEW_ID=${ model.id }`
      ],
      ExposedPorts: { [`${ manager.config.container.port }/tcp`]: {} }
    }).
      then((container) => {
        return container.start();
      }).
      then((container) => {
        console.pp(container);
        callback(null, container);
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
        console.pp(configuration);
        if (configuration.family === 'IPv4' && configuration.internal === false) {
          this.address = configuration.address;
          break;
        }
      }
    }
  }
  return this.address;
};

module.exports = function(manager) {
  return new Docker(manager);
};
