'use strict';

const fs = require('fs');
const { resolve } = require('path');

function Interviews (manager) {
  this.store = new Map();

  this.load = () => {
    const files = fs.readdirSync(manager.config.manager.interviews);
    files.forEach((file) => {
      try {
        const path = resolve(process.cwd(), manager.config.manager.interviews, file);

        const interview = JSON.parse(fs.readFileSync(path));
        interview.state.path = path;

        this.store.set(interview.id, interview);
        interview.users.forEach((user) => {
          this.store.set(user.id, interview);
        });
      } catch (error) {
        console.log('Error loading interview', file);
        console.log(error);
      }
    });
  };
}

module.exports = function(manager) {
  return new Interviews(manager);
};
