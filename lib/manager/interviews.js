'use strict';

const fs = require('fs');
const uuid = require('uuid/v4');
const { resolve } = require('path');

function Interviews (manager) {
  this.store = new Map();

  this.model = ({
    image = 'interrogative-container', volume = 'interrogative-home',
    start, stop, title, company, position, notes, users,
    home = '/home/user', open = [ 'WELCOME.md' ],
    git, repository, buttons, keypairs, state,
    ephemeral = false
  }) => {
    const model = {
      id: uuid(),
      image,
      volume,
      start,
      stop,
      title: title || '',
      company: company || '',
      position: position || '',
      notes: notes || '',
      users: users || [ ],
      home,
      open,
      git: git !== undefined ? git : true,
      repository: repository || home,
      buttons: buttons || [ ],
      keypairs: keypairs || [ ],
      state: state || {
        path: null,
        container: {
          id: null,
          address: null,
          running: false,
          ready: false
        },
        volume: null
      }
    };

    for (const user of users) {
      if (!user.id) {
        user.id = uuid();
      }
      this.store.set(user.id, model);
    }

    this.store.set(model.id, model);

    return model;
  };

  this.bootstrap = () => {
    console.log('Bootstrapping example interview:');
    const soon = Date.now() + 7200000;
    const example = this.model({
      start: soon,
      stop: soon + 604800000,
      title: 'Test Interview',
      company: 'Hyperingenuity',
      position: 'Developer',
      users: [ {
        name: 'Hercules Armstrong',
        role: 'interviewer',
        email: 'hercules@hyperingenuity.com'
      }, {
        name: 'Gary Garrison',
        role: 'candidate',
        email: 'gary@hyperingenuity.com'
      } ],
      ephemeral: true
    });

    console.pp(example);
    return example;
  };

  this.load = () => {
    let files;
    try {
      files = fs.readdirSync(manager.config.manager.storage);
    } catch (error) {
      console.log('Unable to open storage directory, running in ephemeral mode.');
      manager.ephemeral = true;
    }

    if (!manager.ephemeral) {
      files.forEach((file) => {
        try {
          const path = resolve(process.cwd(), manager.config.manager.interviews, file);

          const interview = JSON.parse(fs.readFileSync(path));
          interview.state.path = path;

          this.model(interview);
        } catch (error) {
          console.log('Error loading interview', file);
          console.log(error);
        }
      });
    }

    if (manager.config.manager.bootstrap && this.store.size === 0) {
      this.bootstrap();
    }
  };

  this.lookup = (id) => {
    if (id && this.store.has(id)) {
      return this.store.get(id);
    }
    return undefined;
  };

  this.ready = (id, callback) => {
    if (this.store.has(id)) {
      const model = this.store.get(id);
      if (!model.state.container.id) {
        return manager.docker.boot(model, (error) => {
          if (error) {
            return callback(error);
          }

          const interval = setInterval(() => {
            if (model.state.container.ready) {
              clearInterval(interval);
              return callback(null, model);
            }
            return false;
          }, 500);

          return interval;
        });
      }
      return callback(null, model);
    }
    return callback(new Error('interview not found'));
  };
}

module.exports = function(manager) {
  return new Interviews(manager);
};
