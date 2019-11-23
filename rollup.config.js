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
  babel({
    babelrc: false,
    presets: ["@babel/env"]
  }),
  nodeBuiltIns(),
  nodeGlobals()
];

const BASE_CONFIG = {
  input: "src/index.js",
  external: ["lodash", "is-promise"],
  plugins: [...BASE_PLUGINS, uglifier.uglify()]
};

const GLOBALS = {
  lodash: "lodash",
  "is-promise": "isPromise"
};

module.exports = [
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/core.umd.js",
      format: "umd",
      name: "dataProvider",
      globals: GLOBALS
    }
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/core.esm.js",
      format: "esm",
      globals: GLOBALS
    },
    plugins: BASE_PLUGINS
  }
];
