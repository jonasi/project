/* eslint-env node */

var webpack = require('../../../web/build/webpack');

var config = module.exports = webpack.baseConfig(__dirname);
config.output.publicPath = '/plugins/brew/assets/';
