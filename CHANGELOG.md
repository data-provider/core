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

## [3.1.0] - 2021-12-06

### Changed
- chore: Support any NodeJs version >=12.x.
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update dependencies

### Fixed
- docs: Remove broken npm dependencies badge

## [3.0.2] - 2021-05-21

### Added
- chore(deps): Add Node v16.x to engines

### Changed
- chore(deps): Update dependencies

### Removed
- chore(deps): Remove Node v10.x from engines

## [3.0.1] - 2021-01-27

### Changed
- chore: Update devDependencies

## [3.0.0] - 2021-01-09

### Added
- chore: Add data-provider addons recommended tags to package.json

### Changed
- docs: Adapt docs to data-provider v3 API
- chore(deps): Update dependencies

### BREAKING CHANGES
- feat: Remove v2 compatibility

## [2.3.0] - 2021-01-07

### Added
- feat: Add compatibility with @data-provider/core v3 arguments.

## [2.2.2] - 2020-12-27

### Added
- docs(readme): Add example about using default tag

### Changed
- chore(deps): Update dependencies
- refactor: Use baseTags getter to define base tag (#109)

## [2.2.1] - 2020-12-14

### Added
- test(unit): Add force cleanCache test (#104)

### Changed
- chore(ci): Migrate from Travis CI to GitHub actions. (#100)
- chore(deps): Support all Node.js releases that have not passed their end date
- chore(deps): Update dependencies

## [2.2.0] - 2020-12-06

### Added
- feat(#99): Handle `getItem` exceptions
- feat: Add `storageFallback` option, which allows to disable the storage mock in case there is an error accesing to `localStorage` or `sessionStorage`

## [2.1.0] - 2020-12-06

### Added
- feat(#99): Handle `setItem` exceptions

### Changed
- feat(cache): Force the cleaning of the cache after delete and update methods
- chore(deps): Update devDependencies

## [2.0.6] - 2020-10-31

### Changed
- chore(deps): Update dependencies

## [2.0.5] - 2020-06-21

### Changed
- chore(deps): Update dependencies

## [2.0.4] - 2020-05-16

### Added
- test(stryker): Add stryker tests

### Changed
- chore(deps): Update dependencies

## [2.0.3] - 2020-04-09

### Changed
- chore(deps): Update dependencies

## [2.0.2] - 2020-03-22

### Changed
- chore(deps): update dependencies

## [2.0.1] - 2020-03-18

### Fixed
- fix(namespace): Queried instances were using another namespace in localStorage or browserStorage.

## [2.0.0] - 2020-03-14

> DISCLAIMER: This major release still maintains the concept of the previous "data-provider" versions, but a lot of BREAKING CHANGES have been made to the interfaces in order to improve the usage experience, apart of performance improvements and fixes. A chapter "how to migrate from 1.x" will be added to the documentation website to facilitate the migration to this new version, as the maintenance of 1.X versions will be stopped soon. Read Date Provider Changelog and docs in https://www.data-provider.org for further info.

### Changed
- chore(deps): [BREAKING CHANGE] Update @data-provider dependency to v2.0.0
- feat(providers): [BREAKING CHANGE] Use provider id as item key for localStorage and browserStorage
- feat(providers): [BREAKING CHANGE] Remove create method. Update can be used instead.

## [2.0.0.alpha-2] - 2020-02-26

### Changed
- chore(deps): update @data-provider dependency

## [2.0.0.alpha-1] - 2020-02-23

> DISCLAIMER: This major release adapts this origin to the @data-provider v2.x interface. Read @data-provider docs for further info.

### Changed
- feat(Memory): [BREAKING CHANGE] - Use data-provider v2 standard arguments (id, options)
- feat(Memory): [BREAKING CHANGE] - Queries now has to be defined as an object: { prop: "foo-prop" }
- feat(Memory): [BREAKING CHANGE] - Remove defaultValue argument, now "initialState" option has to be used instead.
- feat(Memory): [BREAKING CHANGE] - Remove queriesDefaultValue option. Now this is the default behavior
- chore(umd distribution): [BREAKING CHANGE] - Rename umd dist file name to "index.umd.js"

## [1.4.3] - 2020-01-26
### Changed
- Update dependencies

## [1.4.2] - 2020-01-12
### Changed
- Update dependencies

## [1.4.1] - 2020-01-12
### Changed
- Update dependencies

## [1.4.0] - 2019-11-24
### Changed
- Upgrade @data-provider/core dependency
- Use new core Provider class instead of Origin
- Export library as CJS
- Improve traces adding package name

### Fixed
- Fix devDependencies vulnerabilities

## [1.3.0] - 2019-11-23
### Changed
- Project migration. Read NOTICE for further info. All previous releases in this CHANGELOG file correspond to @xbyorange/mercury-browser-storage package distribution.

## [1.2.0] - 2019-10-16
### Added
- Add "queriesDefaultValue" option. If defined, queried instances will have default value corresponding to the value of query "key" in the default value object. If not, the behavior of "default value" will be the same than in previous versions, and will return the full object even for queried instances)
- Add "tags" option.

### Changed
- Emit "clean" event over root instance when an "update" is executed on any queried instance. (Full object is modified too).
- Upgrade mercury version and define it as peer dependency.
- Upgrade devDependencies.
- Fix readme examples

## [1.1.0] - 2019-06-28
### Changed
- Upgrade mercury version

### Fixed
- Fix license


## [1.0.0] - 2019-06-03
### BREAKING CHANGES
- Forked from xByOrange reactive-data-source v1.7.0 library. (Only origins.SessionStorage and origins.LocalStorage are exposed from now)
- Extends from Mercury Origin instead of reactive-data-source origin. (Refer to mercury CHANGELOG for further details)
- Now constructors accepts id as optional second argument.