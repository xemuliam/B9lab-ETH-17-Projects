module.exports = {
    entry: "./app/index.html",
    output: {
        path: __dirname + "/build",
        filename: "index.html"
    },
    module: {
        loaders: []
    }
};
