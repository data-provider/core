const path = require("path");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");

module.exports = config => {
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => !(plugin instanceof ModuleScopePlugin)
  );
  config.resolve.alias = {
    ...config.resolve.alias,
    "@data-provider/react": path.resolve(__dirname, "..", "..", "dist", "index.cjs"),
    //"@data-provider/react": path.resolve(__dirname, "src", "src"),
    modules: path.resolve(__dirname, "src", "modules"),
    components: path.resolve(__dirname, "src", "components"),
    data: path.resolve(__dirname, "src", "data"),
    helpers: path.resolve(__dirname, "src", "helpers"),
    react: path.resolve("./node_modules/react"),
    "react-redux": path.resolve("./node_modules/react-redux")
  };
  return config;
};
