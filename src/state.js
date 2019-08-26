function State () {
  this.ready = false;

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

  this.interviewId = '';

  this.id = '';
  this.user = '';
  this.role = 'user';

  this.gitSVG = '';
}

export default new State();
