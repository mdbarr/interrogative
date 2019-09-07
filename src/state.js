function State () {
  this.ready = false;
  this.disconnected = false;

  this.id = '';
  this.interview = {};

  this.config = require('../defaults');
  this.settings = require('./settings');

  this.theme = window.localStorage.getItem('theme') || 'argonaut';
  this.keymap = window.localStorage.getItem('keymap') || 'default';

  this.tree = [];
  this.treeOpen = [];
  this.directories = [];

  this.focus = '';
  this.files = {};

  this.documents = new Map();
  this.images = new Map();
  this.uploads = {};

  this.loading = false;

  this.session = false;

  this.user = '';
  this.name = '';
  this.role = 'user';

  this.online = {};

  this.terminals = [];
  this.terminal = '';

  this.gitSVG = '';
}

export default new State();
