function State () {
  this.config = require('../defaults');

  this.files = [];
  this.filesOpen = [];

  this.loading = false;

  this.session = false;
  this.user = false;
}

export default new State();
