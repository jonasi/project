module.exports = {
    context: __dirname,
    entry: './index.js',
    output: {
        path: __dirname + '/public',
        filename: 'app.js'
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
        ]
    }
};
