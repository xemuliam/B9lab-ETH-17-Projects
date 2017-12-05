var DefaultBuilder = require("truffle-default-builder");

module.exports = {
  build: new DefaultBuilder({
    "index.html": "index.html",
    "app.js": [
      "js/_vendors/angular.min.js",
      "js/app.js"
  ],
  "app.css": [
    "css/app.css"
  ],
  "images/": "images/"
  }),
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    "net42": {
      host: "localhost",
      port: 8545,
      network_id: 42
    },
    "ropsten": {
      host: "localhost",
      port: 8545,
      network_id: 3
    }
  }
};
