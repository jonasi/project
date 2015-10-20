/* eslint-env node */

// https://webpack.github.io/docs/configuration.html

var webpack = require('webpack');
var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';

var config = module.exports = {
    context: __dirname,
    entry: './index.js',
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    target: 'web',

    output: {
        path: path.join(__dirname, 'public'),
        filename: 'app.js',
    },

    module: {
        preLoaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'eslint' },
        ],

        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.css$/, exclude: /node_modules/, loader: 'style!css?modules&importLoaders&localIdentName=[name]__[local]___[hash:base64:10]!postcss' },
        ],
    },

    resolve: {
        alias: {
            web: __dirname,
        },
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(nodeEnv),
        }),
    ],

    postcss: [
        require('autoprefixer'),
        require('postcss-nested'),
    ],
};

if (nodeEnv === 'production') {
    config.devtool = false;
    config.debug = false;
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({ sourceMap: false })
    );
}
