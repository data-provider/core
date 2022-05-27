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

## [4.0.0] - 2022-05-27

### Changed
- chore(deps): Drop support for Node 12.
- chore(deps): Update dependencies

## [3.1.0] - 2021-12-06

### Changed
- chore: Support any NodeJs version >=12.x.
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update dependencies

### Fixed
- docs: Remove broken npm dependencies badge

## [3.0.2] - 2021-05-22

### Added
- chore(deps): Add Node v16.x to engines

### Changed
- chore(deps): Update dependencies

### Removed
- chore(deps): Remove Node v10.x from engines

## [3.0.1] - 2021-01-27

### Changed
- chore(deps): Update devDependencies

## [3.0.0] - 2021-01-09

### Added
- chore: Add data-provider addons recommended tags to package.json

### Changed
- docs: Adapt docs to data-provider v3 API
- chore(deps): Update dependencies

### Fixed
- feat: Add force option when cleaning cache if url is changed

### BREAKING CHANGES
- feat: Url now has to be defined as a property options object. Options has to be passed as first and unique argument.
- feat: Remove v2 compatibility

## [2.1.0] - 2021-01-07

### Added
- feat: Add compatibility with @data-provider/core v3 arguments.

## [2.0.3] - 2020-12-27

### Added
- docs(readme): Add example about using default tag

### Changed
- chore(deps): Update dependencies
- refactor: Use baseTags getter to define base tag (#56)

## [2.0.2] - 2020-12-21

### Changed
- chore(ci): Migrate from Travis CI to GitHub actions. (#53)
- chore(deps): Support all Node.js releases that have not passed their end date
- chore(deps): Update dependencies

## [2.0.1] - 2020-10-31
### Changed
- Update dependencies

## [2.0.0] - 2020-06-21

### BREAKING CHANGES
- chore(deps): Update @data-provider/core to v2
- chore(build): Rename exported files to index.[format].js
- feat(options): tags option has to be an array.

### Changed
- chore(deps): Update dependencies

## [1.5.3] - 2019-01-26
### Changed
- Update dependencies

## [1.5.2] - 2019-01-12
### Changed
- Update dependencies

## [1.5.1] - 2019-01-12
### Changed
- Update dependencies

## [1.5.0] - 2019-11-24
### Changed
- Upgrade @data-provider/core dependency
- Use new core Provider class instead of Origin
- Export library as CJS

### Fixed
- Fix devDependencies vulnerabilities

## [1.4.0] - 2019-11-23
### Changed
- Project migration. __Read NOTICE__ for further info. All previous releases in this CHANGELOG file correspond to @xbyorange/mercury-prismic package distribution.

## [1.3.0] - 2019-10-23
### Added
- Change url configuration in runtime. Clean cache when url changes.

## [1.2.0] - 2019-10-15
### Added
- Add `url` property to config options.

### Changed
- Upgrade mercury version and define it as peer dependency
- Upgrade devDependencies

## [1.1.0] - 2019-06-28
### Changed
- Upgrade mercury version

## [1.0.0] - 2019-06-11
### BREAKING CHANGES
- Forked from xByOrange reactive-data-source v1.7.0 library. (Only origins.Prismic is exposed from now)
- Extends from Mercury Origin instead of reactive-data-source origin. (Refer to mercury CHANLEGOG for further details)
- Change constructor name from PrismicCMS to Prismic