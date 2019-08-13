function State () {
  this.config = require('../defaults');

  this.tree = [];
  this.treeOpen = [];

  this.fileTab = 0;
  this.files = {};

  this.loading = false;

  this.session = false;

  this.id = '';
  this.user = '';
  this.role = 'user';
}

export default new State();
