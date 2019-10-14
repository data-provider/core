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
- Last argument of Selectors will stop being assigned as "defaultValue". To define default value, it will be mandatory to pass an options object as last argument, containing a "defaultValue" property.

## [1.3.0] - 2019-10-10


## [1.2.0] - 2019-10-14
### Added
- Accept options object in Origin constructor as last argument.
- Assign to the `_id` private property the value received in new option "uuid", when received.
- Last argument in Selectors now can be an object containing "defaultValue" and/or "uuid" options.
- Add "sources" handler for managing all instantiated mercury sources as a group.
- Add "config" method to Origin and sources handlers. From now, all Origin implementations can define its own `_config` method, which will be called with the resultant config each time the "config" method is called.

### Changed
- `_id` private property now is a hash of default id and default value (if no "uuid" option is received)
- Objects without query now will emit "undefined" as "_queryId" property in "cleanAny" events, instead of "null".

### Fixed
- Emit `_root` property on cleanAny events of Selectors.

## [1.1.0] - 2019-06-25
### Added
- Expose `_root` property in queried instances to allow identify the root instance.
- Emit `_root` property on cleanAny events.

### Fixed
- Expose custom queries methods in `customQueries` property, as described in documentation.
- Expose test.queries properties for concurrent sources.

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
