/* eslint-env node */

// https://webpack.github.io/docs/configuration.html

var webpack = require('webpack');
var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';

exports.baseConfig = function(baseDir) {
    var config = {
        context: baseDir,
        entry: './index.js',
        debug: true,
        devtool: 'cheap-module-eval-source-map',
        target: 'web',

        output: {
            path: path.join(baseDir, 'public'),
            publicPath: '/assets/',
            filename: 'app.js',
        },

        module: {
            preLoaders: [
                { test: /\.js$/, exclude: /node_modules/, loader: 'eslint' },
            ],

            loaders: [
                { test: /\.js$/, exclude: /node_modules/, loader: 'babel?optional[]=runtime' },
                { test: /\.css$/, exclude: /node_modules/, loader: 'style!css?modules&importLoaders&localIdentName=[name]__[local]___[hash:base64:10]!postcss' },
                { test: /\.css$/, include: /node_modules/, loader: 'style!css' },
                { test: /\.woff($|\?)/, loader: 'url-loader?limit=10000' },
                { test: /\.woff2($|\?)/, loader: 'url-loader?limit=10000' },
                { test: /\.otf($|\?)/, loader: 'url-loader?limit=10000' },
                { test: /\.ttf($|\?)/, loader: 'url-loader?limit=10000' },
                { test: /\.eot($|\?)/, loader: 'url-loader?limit=10000' },
                { test: /\.svg($|\?)/, loader: 'url-loader?limit=10000' },
                { test: /\.png$/, loader: 'url-loader?limit=10000' },
                { test: /\.jpg$/, loader: 'url-loader?limit=10000' },
                { test: /\.gif$/, loader: 'url-loader?limit=10000' },
            ],
        },

        resolve: {
            fallback: path.join(__dirname, '..', 'node_modules'),
            alias: {
                web: path.join(__dirname, '..'),
            },
        },

        resolveLoader: {
            fallback: path.join(__dirname, '..', 'node_modules'),
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

    return config;
};
