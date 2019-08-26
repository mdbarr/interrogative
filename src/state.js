function State () {
  this.ready = false;
  this.id = '';
  this.interview = {};

  this.config = require('../defaults');
  this.settings = require('./settings');
  this.theme = 'argonaut';
  this.keymap = 'default';

  this.tree = [];
  this.treeOpen = [];

  this.focus = '';
  this.files = {};

  this.documents = new Map();
  this.images = new Map();

  this.loading = false;

  this.session = false;

  this.user = '';
  this.name = '';
  this.role = 'user';

  this.gitSVG = '';
}

export default new State();
