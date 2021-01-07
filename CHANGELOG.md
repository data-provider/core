# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
- feat: Add compatibility with @data-provider/core v3 arguments.
### Changed
### Fixed
### Removed

## [2.0.7] - 2020-12-27

### Added
- docs(readme): Add example about using default tag

### Changed
- chore(deps): Update dependencies
- refactor: Use baseTags getter to define base tag (#94)

## [2.0.6] - 2020-12-14

### Changed
- chore(ci): Migrate from Travis CI to GitHub actions. (#89)
- chore(deps): Support all Node.js releases that have not passed their end date
- chore(deps): Update dependencies

### Fixed
- fix: Force cleaning of cache after update or delete (#91)

## [2.0.5] - 2020-10-31

### Changed
- chore(deps): Update dependencies

## [2.0.4] - 2020-06-21

### Changed
- chore(deps): Update dependencies

## [2.0.3] - 2020-05-16

### Added
- test(stryker): Add stryker tests

### Changed
- chore(deps): Update dependencies

## [2.0.2] - 2020-04-09

### Changed
- chore(deps): Update dependencies

## [2.0.1] - 2020-03-22

### Changed
- chore(deps): update dependencies

### Fixed
- fix(tags): Clone tags option before adding origin tag.

## [2.0.0] - 2020-03-14

> DISCLAIMER: This major release still maintains the concept of the previous "data-provider" versions, but a lot of BREAKING CHANGES have been made to the interfaces in order to improve the usage experience, apart of performance improvements and fixes. A chapter "how to migrate from 1.x" will be added to the documentation website to facilitate the migration to this new version, as the maintenance of 1.X versions will be stopped soon. Read Date Provider Changelog and docs in https://www.data-provider.org for further info.

### Changed
- chore(deps): [BREAKING CHANGE] Update @data-provider dependency to v2.0.0
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
- feat(Memory): [BREAKING CHANGE] - Remove uuid option. Now id is required as first argument.
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
- Use new core Provider class instead of Origin.
- Export library as CJS.
- Improve traces adding package name.
- Adapt documentation to new version of @data-provider/core.

### Removed
- Remove method to be deprecated from documentation.

### Fixed
- Fix devDependencies vulnerabilities

## [1.3.0] - 2019-11-23
### Changed
- Project migration. Read NOTICE for further info. All previous releases in this CHANGELOG file correspond to @xbyorange/mercury-memory package distribution.

## [1.2.0] - 2019-10-16
### Added
- Add "queriesDefaultValue" option. If defined, queried instances will have default value corresponding to the value of query "key" in the default value object. If not, the behavior of "default value" will be the same than in previous versions, and will return the full object even for queried instances)
- Add "uuid" and "tags" options.
- Accept options object as second argument. (And still accepts "id" as second argument, and options as third argument in order to maintain retro-compatibility)

### Changed
- Emit "clean" event over root instance when an "update" is executed on any queried instance. (Full object is modified too).
- Upgrade mercury version and define it as peer dependency.
- Upgrade devDependencies.

## [1.1.0] - 2019-06-28
### Changed
- Upgrade mercury version

### Fixed
- Fix license

## [1.0.0] - 2019-06-03
### BREAKING CHANGES
- Forked from xByOrange reactive-data-source v1.7.0 private library. (Only origins.Api is exposed from now)
- Extends from Mercury Origin instead of reactive-data-source origin. (Refer to mercury CHANLEGOG for further details)
- Now constructor accepts id as optional second argument.
