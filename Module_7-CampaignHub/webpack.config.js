module.exports = {
    entry: "./app/js/app.js",
    output: {
        path: __dirname + "/build/app",
        filename: "app.js"
    },
    module: {
        loaders: []
    }
};
