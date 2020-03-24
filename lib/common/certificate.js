'use strict';

const selfsigned = require('selfsigned');

function Certificate () {
  this.selfsigned = () => {
    const attributes = [ {
      name: 'commonName',
      value: 'interrogative.io',
    } ];
    const pems = selfsigned.generate(attributes, { days: 365 });

    this.key = pems.private;
    this.public = pems.public;
    this.cert = pems.cert;
  };

  this.selfsigned();
}

module.exports = function(parent, options) {
  return new Certificate(parent, options);
};
