/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const json = require("@rollup/plugin-json");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const uglifier = require("rollup-plugin-uglify");

const BASE_PLUGINS = [
  resolve({
    mainFields: ["module", "main"],
    preferBuiltins: true,
  }),
  commonjs({
    include: "node_modules/**",
  }),
  json(),
  babel({
    babelrc: false,
    presets: ["@babel/env"],
  }),
];

const BASE_CONFIG = {
  input: "src/index.js",
  external: ["@data-provider/core"],
  plugins: [...BASE_PLUGINS, uglifier.uglify()],
};

const GLOBALS = {
  "@data-provider/core": "dataProvider",
};

module.exports = [
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.cjs.js",
      format: "cjs",
    },
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.umd.js",
      format: "umd",
      name: "dataProviderBrowserStorage",
      globals: GLOBALS,
    },
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.esm.js",
      format: "esm",
      globals: GLOBALS,
    },
    plugins: BASE_PLUGINS,
  },
];
