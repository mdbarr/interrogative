'use strict';

const { milliseconds } = require('barrkeep/utils');

function Cache () {
  const store = new Map();
  const index = new Map();

  this.add = (model) => {
    const entry = {
      model,
      ttl: model.ephemeral ? Infinity :
        Date.now() + milliseconds('6h')
    };

    store.set(model.id, model);

    if (model.object === 'interview') {
      for (const id of model.ids) {
        store.set(id, model);
      }
    } else if (model.object === 'user') {
      store.set(model.email, model);
    }

    index.set(model, entry);
  };

  this.has = (id) => {
    return store.has(id);
  };

  this.get = (id) => {
    if (store.has(id)) {
      const model = store.get(id);
      if (index.has(model)) {
        const entry = index.get(model);
        entry.ttl = Math.max(entry.ttl, Date.now() + milliseconds('6h'));
      } else {
        this.add(model);
      }
      return model;
    }
    return undefined;
  };

  this.delete = (model) => {
    if (index.has(model)) {
      if (model.object === 'interview') {
        for (const id of model.ids) {
          store.delete(id);
        }
      } else if (model.object === 'user') {
        store.delete(model.email);
      }

      store.delete(model.id);
      index.delete(model);

      return true;
    }

    return false;
  };

  this.interval = setInterval(() => {
    for (const [ model, entry ] of index) {
      if (Date.now() > entry.ttl) {
        console.log(`[manager] purging ${ model.object }/${ model.id } from cache`);

        this.delete(model);
      }
    }
  }, milliseconds('5m'));
}

module.exports = function(manager, options) {
  return new Cache(manager, options);
};
