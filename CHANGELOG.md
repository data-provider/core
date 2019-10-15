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
- "useLegacyDefaultValue" option has to be removed.
- Options should be accepted only as second argument. "uuid" should be defined only using the "uuid" option, not as second argument.

## [2.0.0] - 2019-10-15
### BREAKING CHANGES
- Queried instances will have default value corresponding to the value of query "key" in the default value object (until new option "useLegacyDefaultValue" is received, in which case the behavior of "default value" will be the same than in previous versions)

### Added
- Add "useLegacyDefaultValue" option.
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
