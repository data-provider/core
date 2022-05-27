// For a detailed explanation regarding each configuration property, visit:
// https://mocks-server.org/docs/configuration-options
// https://mocks-server.org/docs/configuration-methods

module.exports = {
  log: "debug",
  plugins: {
    inquirerCli: {
      // Start interactive CLI plugin or not
      enabled: false,
    },
  },
  mocks: {
    // Selected mock
    selected: "base",
    // Global delay to apply to routes
    //delay: 0,
  },
};
