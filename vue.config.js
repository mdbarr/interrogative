const config = require('./defaults');

module.exports = { devServer: { proxy: {
  '^/api': { target: `http://localhost:${ config.port }` },
  '^/ws': {
    target: `ws://localhost:${ config.container.port }`,
    ws: true
  }
} } };
