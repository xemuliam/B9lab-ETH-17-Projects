const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './app/js/app.js',
    output: {
        path: __dirname + "/build/app/js",
        filename: 'app.js'
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './app/index.html', to: "../index.html" },
            { from: './app/js/_vendors', to: "_vendors" },
            { from: './app/images', to: "../images" },
            { from: './app/css', to: "../css" }
        ]),
    ],
    module: {
        loaders: []
    }
}
