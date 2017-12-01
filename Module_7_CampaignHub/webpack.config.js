module.exports = {
    entry: "./app/js/app.js",
    output: {
        path: __dirname + "/build",
        filename: "index.html"
    },
    module: {
        loaders: []
    }
};
