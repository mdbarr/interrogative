'use strict';

function Timeline () {
  this.timeline = [];
}

module.exports = function(container, options) {
  return new Timeline(container, options);
};
