const path = require("path");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");

module.exports = config => {
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => !(plugin instanceof ModuleScopePlugin)
  );
  config.resolve.alias = {
    ...config.resolve.alias,
    "@data-provider/core": path.resolve(__dirname, "..", "..", "..", "dist", "core.cjs"),
    modules: path.resolve(__dirname, "src", "modules"),
    components: path.resolve(__dirname, "src", "components"),
    data: path.resolve(__dirname, "src", "data"),
    helpers: path.resolve(__dirname, "src", "helpers")
  };
  return config;
};
