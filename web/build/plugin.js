/* eslint-env node */

var webpack = require('./webpack');

exports.pluginConfig = function(baseDir, pluginName) {
    var conf = webpack.baseConfig(baseDir);
    conf.output.publicPath = '/plugins/' + pluginName + '/assets/';

    return conf;
};
