const StyleLintPlugin = require('stylelint-webpack-plugin');
const config = require('./defaults');

module.exports = {
  configureWebpack: { plugins: [
    new StyleLintPlugin({ files: [ 'src/**/*.{vue,scss}' ] }),
  ] },
  devServer: {
    host: '0.0.0.0',
    public: '0.0.0.0:8080',
    disableHostCheck: true,
    proxy: {
      '^/api': { target: `http://localhost:${ config.manager.port }` },
      '^/ws': {
        target: `ws://localhost:${ config.manager.port }`,
        ws: true,
      },
    },
  },
  filenameHashing: process.env.NODE_ENV !== 'production',
  transpileDependencies: [
    'vuetify',
  ],
};
