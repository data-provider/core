const BRANCH_NAME = process.env.TRAVIS_CURRENT_BRANCH;
const STRYKER_API_KEY = process.env.STRYKER_API_KEY;

const BASE_CONFIG = {
  mutator: "javascript",
  files: ["*.js", "src/**/*.js", "test/**/*.js"],
  packageManager: "npm",
  dashboard: {
    project: "github.com/data-provider/memory",
    version: "release",
  },
  thresholds: {
    high: 80,
    low: 60,
    break: 80,
  },
  reporters: ["html", "clear-text", "progress", "dashboard"],
  testRunner: "jest",
  transpilers: ["babel"],
  coverageAnalysis: "off",
  babel: {
    optionsFile: ".babelrc",
  },
};

const config = {
  ...BASE_CONFIG,
  dashboard:
    BRANCH_NAME && STRYKER_API_KEY
      ? {
          project: "github.com/data-provider/memory",
          version: BRANCH_NAME,
        }
      : undefined,
};

module.exports = config;
