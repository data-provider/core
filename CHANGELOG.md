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

## [1.1.0] - 2019-06-25
### Added
- Expose `_root` property in queried instances to allow identify the root instance.

### Fixed
- Expose custom queries methods in `customQueries` property, as described in documentation.

## [1.0.0] - 2019-06-03
### BREAKING CHANGES
- Forked from xByOrange reactive-data-source v1.7.0 private library. (Only Origin and Selector are exposed from now)
- Change "filter" property to "query"
- Change property "\_isDataSource" to "\_isSourceMethod" and "\_isSource"
- Change "addCustomFilters" and "addCustomFilter" by "addCustomQueries" and "addCustomQuery"
- Change Selectors "test.filters" by "test.queries"
- Default values are now "undefined", not "null"

### Added
- Selectors now accept arrays of sources. Will be executed in parallel.
- Selector sources accept new "catch" property. Will catch errors and return returned value. Accepts returning another source, and will listen too to clean cache events.
- Selector now can return another source. onClean listener will be added to him too.
- Selectors accept all CRUD methods. Will crash if using method different to READ when no returning a source.
