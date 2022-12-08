# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed
### BREAKING CHANGES

## [5.0.2] - 2022-12-08

### Changed
- chore(deps): Update axios-retry to 1.2.1
- chore(deps): Update query-string to 7.1.3

## [5.0.1] - 2022-08-30

### Changed
- chore(deps): Update axios-retry to 3.3.1

## [5.0.0] - 2022-05-27

### Changed
- chore(deps): Drop support for Node 12.
- chore(deps): Update dependencies

## [4.1.0] - 2021-12-06

### Changed
- chore: Support any NodeJs version >=12.x.
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update dependencies
- test: Use 127.0.0.1 instead of localhost when requesting in tests for Node 17 support

### Fixed
- docs: Remove broken npm dependencies badge

## [4.0.0] - 2021-07-31

### Changed
- feat(#6): Use [query-string](https://www.npmjs.com/package/query-string) package to format query strings. Allow configuring query-string options using the `queryStringConfig` option of this package. This is a BREAKING CHANGE because query-string default options are used (read BREAKING CHANGES bellow for further info)
- chore(deps): Update devDependencies

### BREAKING CHANGES
- Arrays in query strings were converted into a list separated by "%2C" (url encoded comma). Now it uses the `query-string` package using its default options, so arrays are serialized duplicating keys (`?foo=1&foo=2`). This behaviour can be configured using the new `queryStringConfig` option.
- query string keys now are sorted by default.

## [3.1.0] - 2021-06-18
### Added
- feat(#140): Support body params in delete method
- docs: Add axiosConfig option to docs

### Changed
- chore(deps): Update dependencies

## [3.0.2] - 2021-05-21

### Added
- chore(deps): Add Node v16.x to engines

### Changed
- chore(deps): Update dependencies

### Removed
- chore(deps): Remove Node v10.x from engines

## [3.0.1] - 2021-01-27

### Changed
- chore(deps): Update devDependencies
- chore(deps): Update axios to v0.21.1

## [3.0.0] - 2021-01-09

### Added
- chore: Add data-provider addons recommended tags to package.json

### Changed
- docs: Adapt docs to data-provider v3 API
- chore(deps): Update dependencies

### BREAKING CHANGES
- feat: Remove v2 compatibility

## [2.2.0] - 2021-01-07

### Added
- feat: Add compatibility with @data-provider/core v3 arguments.

## [2.1.7] - 2020-12-27

### Added
- docs(readme): Add example about using default tag

### Changed
- chore(deps): Update dependencies
- refactor: Use baseTags getter to define base tag (#108)
- chore(ci): Add GitHub action to run mutation tests on master branch

## [2.1.6] - 2020-12-18

### Changed
- chore(ci): Migrate from Travis CI to GitHub actions. (#103)
- chore(deps): Support all Node.js releases that have not passed their end date
- chore(deps): Update dependencies

## [2.1.5] - 2020-11-24

### Added
- chore(release): Add github actions to check package version and publish to gpr

### Changed
- feat(cache): Force the cleaning of the cache after CUD requests

## [2.1.4] - 2020-10-31

### Changed
- chore(deps): Update dependencies
- chore: Rename stryker commands

## [2.1.3] - 2020-06-21

### Changed
- chore(deps): Update dependencies

## [2.1.2] - 2020-05-16

### Added
- test(stryker): Add stryker tests

### Changed
- chore(deps): Update dependencies

## [2.1.1] - 2020-04-09

### Changed
- chore(deps): Update dependencies

## [2.1.0] - 2020-03-22

### Added
- feat(options): Add "axiosConfig" option. This configuration object will be passed directly to requests. Read the [Axios docs](https://github.com/axios/axios) for further info about available options.

### Changed
- chore(deps): update dependencies

### Fixed
- fix(tags): Clone tags option before adding origin tag.

## [2.0.1] - 2020-03-16

### Fixed
- fix(events): Fix event names. Did not match with events described in docs.

### Added
- feat(events): Export eventNames constants.

## [2.0.0] - 2020-03-14

> DISCLAIMER: This major release still maintains the concept of the previous "data-provider" versions, but a lot of BREAKING CHANGES have been made to the interfaces in order to improve the usage experience, apart of performance improvements and fixes. A chapter "how to migrate from 1.x" will be added to the documentation website to facilitate the migration to this new version, as the maintenance of 1.X versions will be stopped soon. Read Date Provider Changelog and docs in https://www.data-provider.org for further info.

### Changed
- chore(deps): [BREAKING CHANGE] Update @data-provider dependency to v2.0.0
- feat(options): [BREAKING CHANGE] Rename `createMethod`, `readMethod`, `updateMethod` and `deleteMethod` options into `createVerb`, `readVerb`, `updateVerb` and `deleteVerb`.

## [2.0.0.alpha-2] - 2020-02-26

### Changed
- chore(deps): update @data-provider dependency

## [2.0.0-alpha.1] - 2020-02-23

> DISCLAIMER: This major release adapts this origin to the @data-provider v2.x interface. Read @data-provider docs for further info.

### Changed
- feat(Axios): [BREAKING CHANGE] - Rename exported Class from Api to Axios
- feat(Axios): [BREAKING CHANGE] - Use data-provider v2 standard arguments (id, options)
- feat(Axios): [BREAKING CHANGE] - Url now has to be defined as "url" option in the second argument. First argument is the provider id.
- feat(Axios): [BREAKING CHANGE] - Remove uuid option. Now id is required as first argument.
- chore(umd distribution): [BREAKING CHANGE] - Rename umd dist file name to "index.umd.js"
- feat(apis): [BREAKING CHANGE] - setHeaders and addHeaders method now has to be called through providers, and will not define headers for instances still not created.

### Removed
- feat(apis): [BREAKING CHANGE] - Remove apis handler. Use @data-provider/core providers instead.
- feat(apis): To call "addHeaders" and "setHeaders" method, use providers.call("addHeaders");

## [1.6.1] - 2020-01-12
### Changed
- Update dependencies

## [1.6.0] - 2020-01-11
### Fixed
- Upgrade axios version
- Maintain trailing slash in urls with params

### Changed
- Upgrade path-to-regex dependency
- Upgrade devDependencies

## [1.5.0] - 2019-11-24
### Changed
- Upgrade @data-provider/core dependency
- Use new core Provider class instead of Origin.
- Use new core instances object instead of sources.
- Export library as CJS
- Improve traces adding package name.
- Adapt documentation to new version of @data-provider/core.

## [1.4.0] - 2019-11-23
### Changed
- Project migration. Read NOTICE for further info. All previous releases in this CHANGELOG file correspond to @xbyorange/mercury-api package distribution.
 
## [1.3.0] - 2019-10-18
### Changed
- Upgrade mercury version. Use mercury "sources" methods from "apis" methods. Keep "apis" methods due to retrocompatibility.
- Downgrade axios minor version to 0.18.0 until axios-retry fix issue https://github.com/softonic/axios-retry/issues/59

### Fixed
- Fix "retry" option.

## [1.2.0] - 2019-06-28
### Changed
- Upgrade mercury version

## [1.1.0] - 2019-06-10
### Added
- Add `apis` method, which allows to configure, manage headers or clean multiple apis at a time. Groups of apis can be defined using new config property called `tags`.

### Changed
- Upgrade dependencies

## [1.0.1] - 2019-06-03
### Fixed
- Upgrade Axios dependency to fix a potential vulnerability.
- Fix events unit test.

## [1.0.0] - 2019-06-03
### BREAKING CHANGES
- Forked from xByOrange reactive-data-source v1.7.0 library. (Only origins.Api is exposed from now)
- Extends from Mercury Origin instead of reactive-data-source origin. (Refer to mercury CHANLEGOG for further details)
- Removed methods option. Now constructor accepts only two arguments.

### Changed
- query and params becomes queryString and urlParams. Old keys are maintained for retrocompatibility.
