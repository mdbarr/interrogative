'use strict';

const fs = require('fs');
const uuid = require('uuid/v4');
const { resolve } = require('path');

function Interviews (manager) {
  this.store = new Map();

  this.model = ({
    image = 'interrogative-container', volume = 'interrogative-home',
    start, stop, name, company, position, notes, users,
    home = '/home/user', open = [ 'WELCOME.md' ],
    git, repository, buttons, keypairs, state
  }) => {
    const model = {
      id: uuid(),
      image,
      volume,
      start,
      stop,
      name: name || '',
      company: company || '',
      position: position || '',
      notes: notes || '',
      users: users || [ ],
      home,
      open,
      git: Boolean(git),
      repository: repository || null,
      buttons: buttons || [ ],
      keypairs: keypairs || [ ],
      state: state || {
        path: null,
        container: {
          id: null,
          address: null,
          running: false
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
    const example = this.model({
      start: Date.now(),
      stop: Date.now() + 604800000,
      name: 'Test Interview',
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
      } ]
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

  this.ready = (id, callback) => {
    if (this.store.has(id)) {
      const model = this.store.get(id);
      if (!model.state.container.id) {
        return manager.docker.boot(model, callback);
      }
      return callback(null, model);
    }
    return callback(new Error('interview not found'));
  };
}

module.exports = function(manager) {
  return new Interviews(manager);
};
