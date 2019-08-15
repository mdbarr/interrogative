const config = require('./defaults');

module.exports = { devServer: {
  host: '0.0.0.0',
  public: '0.0.0.0:8080',
  disableHostCheck: true,
  proxy: {
  '^/api': { target: `http://localhost:${ config.port }` },
  '^/ws': {
    target: `ws://localhost:${ config.container.port }`,
    ws: true
  }
} } };
