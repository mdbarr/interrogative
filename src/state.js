function State () {
  this.config = require('../defaults');

  this.loading = false;

  this.session = false;
  this.user = false;
}

export default new State();
