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
- "Origin" constructor. "Provider" has to be used instead.
- "source" property in selectors. "provider" has to be used instead.
- "source" property emitted in events. "provider" has to be used instead.
- "sources" handler. "instances" has to be used instead.

## [1.7.3] - 2020-01-13
### Changed
- Update dependencies

## [1.7.2] - 2020-01-12
### Changed
- Use fixed versioning

## [1.7.1] - 2020-01-12
### Changed
- Update dependencies

## [1.7.0] - 2019-11-23
### Changed
- Rename Origin into Provider. Maintain Origin due to backward compatibility.
- Rename sources into instances. Maintain sources due to backward compatibility.
- Change selectors "source" property to "provider". Maintain also old property due to backward compatibility.
- Improve traces, add package name namespace.
- Export library in CJS format.

## [1.6.0] - 2019-11-23
### Changed
- Project migration. Read NOTICE for further info. All previous releases in this CHANGELOG file correspond to @xbyorange/mercury package distribution.

## [1.5.0] - 2019-10-14
### Added
- Add `stats` property containing counters of method actions executions.

### Changed
- Upgrade devDependencies

## [1.4.0] - 2019-10-14
### Added
- Selectors can now return an array of sources.
- Selectors can now return sources defined as objects containing `query` and/or `catch` property.

### Fixed
- Fix Sonar code smell.

## [1.3.0] - 2019-10-14
### Added
- defaultValue argument in Origin Constructor now can be a function. It will be called to obtain the defaultValue, passing to it the current query as argument.
- Add utility for testing catch functions of selector sources.

## [1.2.0] - 2019-10-14
### Added
- Accept options object in Origin constructor as last argument.
- Assign to the `_id` private property the value received in new option "uuid", when received.
- Last argument in Selectors now can be an object containing "defaultValue" and/or "uuid" options.
- Add "sources" handler for managing all instantiated mercury sources as a group.
- Add "config" method to Origin and sources handlers. From now, all Origin implementations can define its own `_config` method, which will be called with the resultant config each time the "config" method is called.

### Changed
- `_id` private property now is a hash of default id and default value (if no "uuid" option is received)
- Objects without query now will emit "undefined" as "\_queryId" property in "cleanAny" events, instead of "null".

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
