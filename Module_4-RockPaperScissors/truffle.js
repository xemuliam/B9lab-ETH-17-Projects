module.exports = {
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