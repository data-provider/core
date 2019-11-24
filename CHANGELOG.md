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

## [TO BE DEPRECATED]
- "queriesDefaultValue" option has to be removed.

## [1.4.0] - 2019-11-24
### Changed
- Upgrade @data-provider/core dependency
- Export library as CJS

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