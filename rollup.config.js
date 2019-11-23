const json = require("rollup-plugin-json");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const nodeBuiltIns = require("rollup-plugin-node-builtins");
const nodeGlobals = require("rollup-plugin-node-globals");
const uglifier = require("rollup-plugin-uglify");

const BASE_PLUGINS = [
  resolve({
    module: true,
    main: true,
    browser: true,
    jsnext: true,
    preferBuiltins: true
  }),
  commonjs({
    include: "node_modules/**"
  }),
  json(),
  babel(),
  nodeBuiltIns(),
  nodeGlobals()
];

const BASE_CONFIG = {
  input: "src/index.js",
  external: ["@data-provider/core", "lodash"],
  plugins: [...BASE_PLUGINS, uglifier.uglify()]
};

const GLOBALS = {
  "@data-provider/core": "dataProvider",
  lodash: "lodash"
};

module.exports = [
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/memory.umd.js",
      format: "umd",
      name: "memoryDataProvider",
      globals: GLOBALS
    }
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/memory.esm.js",
      format: "esm",
      globals: GLOBALS
    },
    plugins: BASE_PLUGINS
  }
];
