function State () {
  this.config = require('../defaults');

  this.files = [];
  this.filesOpen = [];

  this.loading = false;

  this.session = false;

  this.id = '';
  this.user = '';
  this.role = 'user';
}

export default new State();
