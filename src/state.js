function State () {
  this.config = require('../defaults');

  this.tree = [];
  this.treeOpen = [];

  this.focus = '';
  this.files = {};

  this.documents = new Map();
  this.images = new Map();

  this.loading = false;

  this.session = false;

  this.id = '';
  this.user = '';
  this.role = 'user';

  this.gitSVG = '';
}

export default new State();
