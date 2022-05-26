const path = require("path");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const EslintPlugin = require("eslint-webpack-plugin");

function removeEslintPlugin(config) {
  let eslintPluginIndex;
  config.plugins.forEach((plugin, pluginIndex) => {
    if (plugin instanceof EslintPlugin) {
      eslintPluginIndex = pluginIndex;
    }
  });
  if (eslintPluginIndex) {
    config.plugins.splice(eslintPluginIndex, 1);
  }
  return config;
}

module.exports = (config) => {
  removeEslintPlugin(config);
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => !(plugin instanceof ModuleScopePlugin)
  );
  config.resolve.alias = {
    ...config.resolve.alias,
    modules: path.resolve(__dirname, "src", "modules"),
    components: path.resolve(__dirname, "src", "components"),
    data: path.resolve(__dirname, "src", "data"),
    helpers: path.resolve(__dirname, "src", "helpers"),
  };
  return config;
};
