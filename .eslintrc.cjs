module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2018,
    requireConfigFile: false,
  },
  plugins: ["prettier", "@nrwl/nx"],
  extends: ["prettier"],
  rules: {
    "prettier/prettier": [
      2,
      {
        printWidth: 99,
        parser: "flow",
      },
    ],
    "no-shadow": [2, { builtinGlobals: true, hoist: "all" }],
    "no-undef": 2,
    "no-unused-vars": [2, { vars: "all", args: "after-used", ignoreRestSiblings: false }],
    "@nrwl/nx/enforce-module-boundaries": [
      2,
      {
        allow: [],
        depConstraints: [
          {
            sourceTag: "type:example",
            onlyDependOnLibsWithTags: ["type:lib"],
          },
          {
            sourceTag: "type:mock",
            onlyDependOnLibsWithTags: ["type:lib"],
          },
          {
            sourceTag: "type:lib",
            onlyDependOnLibsWithTags: ["type:lib", "type:mock"],
          },
          {
            sourceTag: "type:app",
            onlyDependOnLibsWithTags: ["type:lib"],
          },
          {
            sourceTag: "type:test",
            onlyDependOnLibsWithTags: [
              "type:lib",
              "type:app",
              "type:mock",
              "type:specs",
              "type:example",
            ],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["packages/*/test/**/*.js", "test/*/src/**/*.js"],
      globals: {
        jest: true,
        beforeAll: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
        describe: true,
        expect: true,
        it: true,
      },
    },
    {
      files: ["test/*/cypress/**/*.js"],
      globals: {
        Cypress: true,
        cy: true,
        before: true,
        beforeEach: true,
        afterEach: true,
        after: true,
        describe: true,
        expect: true,
        it: true,
      },
    },
    {
      files: ["scripts/**/*.js", "**/*.mjs"],
      parser: "@babel/eslint-parser",
      parserOptions: {
        sourceType: "module",
        allowImportExportEverywhere: true,
        requireConfigFile: false,
      },
      globals: {
        module: true,
      },
    },
  ],
};
