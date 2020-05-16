module.exports = {
  mutator: "javascript",
  files: ["*.js", "src/**/*.js", "test/**/*.js"],
  packageManager: "npm",
  dashboard: {
    project: "github.com/data-provider/core",
    version: "master",
  },
  reporters: ["html", "clear-text", "progress", "dashboard"],
  testRunner: "jest",
  transpilers: ["babel"],
  coverageAnalysis: "off",
  babel: {
    optionsFile: ".babelrc",
  },
};
