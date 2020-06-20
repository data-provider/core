# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [2.4.1] - 2020-06-20

### Changed
- chore(deps): Update dependencies

## [2.4.0] - 2020-06-07

### Added
- feat(Selector): Add cleanDependenciesCache method. [Issue #79](https://github.com/data-provider/core/issues/79)

### Changed
- chore(deps): Update dependencies

## [2.3.0] - 2020-06-06

### Added
- feat(state): Add loaded state property. [Issue #81](https://github.com/data-provider/core/issues/81)

### Changed
- chore(deps): Update dependencies
- style(lint): Lint cypress tests and root js files

## [2.2.1] - 2020-05-15

### Added
- test(stryker): Add stryker tests

### Changed
- chore(deps): Update dependencies

## [2.2.0] - 2020-05-01

### Added
- feat(Provider): Add `cacheTime` and `cleanCacheInterval` options. Described in [issue 80](https://github.com/data-provider/core/issues/80)
- feat(Selector): Add `getChildQueryMethod` option. Described in [issue 78](https://github.com/data-provider/core/issues/78)

### Changed
- chore(deps): Update dependencies

## [2.1.2] - 2020-04-09

### Changed
- chore(deps): Update dependencies

## [2.1.1] - 2020-03-21

### Fixed
- fix(providers): Set provider id before running `onNewProvider` listeners.

### Changed
- chore(deps): Update dependencies

## [2.1.0] - 2020-03-19

### Added
- feat(providers): Add `onNewProvider` method, which allows to execute a callback each time a new provider is created (also filtered by tag)

### Changed
- chore(deps): Update dependencies

## [2.0.0] - 2020-03-14

> DISCLAIMER: This major release still maintains the concept of the previous "data-provider" versions, but a lot of BREAKING CHANGES have been made to the interfaces in order to improve the usage experience, apart of performance improvements and fixes. A chapter "how to migrate from 1.x" will be added to the documentation website to facilitate the migration to this new version, as the maintenance of 1.X versions will be stopped soon. Read 2.0 pre-releases changelog and docs in https://www.data-provider.org for further info.

### Added
- feat(events): Pass child causing an `onChild` event to the listener function.
- feat(events): Export eventNames constants.
- feat(selector): Accept promises or any other value as dependency. Accept dependencies returning any other type of dependendencies.
- feat(selector): Export "catchDependencies" utility for catching dependencies errors, as defining dependencies as objects has been deprecated.
- feat(providers): Avoid id duplications. Add suffix when conflict is detected.

### Removed
- feat(events): Remove changeState events wildcard.
- feat(selector): Deprecate defining dependencies as objects.

### Fixed
- fix(events): Fix once methods arguments. Use arguments spread to get original arguments.

## [2.0.0-alpha.6] - 2020-02-25
### Removed
- feat(Provider): Do not pass previous State as argument in events.
- feat(Provider): Remove stats and cache flag from state. Save resources. Only loading, data and error are in state now.

## [2.0.0-alpha.5] - [WRONG RELEASE, published from wrong branch]

## [2.0.0-alpha.4] - 2020-02-23
### Fixed
- fix(Provider): Emit "changeState" children event.

## [2.0.0-alpha.3] - 2020-02-23
### Added
- feat(Provider): Add cache option, which disables cache if set to false. Default is true.

### Changed
- feat(Provider): [BREAKING CHANGE] Rename createChild into createChildMethod, for better identification of methods that can be overwritten.
- feat(Provider): [BREAKING CHANGE] Rename addQueryMethod into addQuery, to avoid confussions as it is not designed to be overwritten by data origins implementations.

### Added
- feat(Provider): Add "getChildQueryMethod", which allow origins to define its own method for extending child queries.

## [2.0.0-beta.2] - 2020-02-22 [DEPRECATED] This version was intended to be a prerelease.
### Added
- feat(initial state): Allow plugins to define his own initialState getter, overwritting the original one. 

## [2.0.0-beta.1] - 2020-02-22 [DEPRECATED] This version was intended to be a prerelease.

> DISCLAIMER: This major release still maintains the concept of the previous "data-provider" versions, but a lot of BREAKING CHANGES have been made to the interfaces in order to improve the usage experience, apart of performance improvements and fixes. A chapter "how to migrate from 1.x" will be added to the documentation website to facilitate the migration to this new version, as the maintenance of 1.X versions will be stopped soon.

### Added
- feat(Provider): Use Redux internally for handling state. Added storeManager to allow to migrate the internal store to any other shared store.
- feat(storeManager): Expose storeManager, which allows to manage the redux store. 
- feat(Selector): Selector dependencies can be defined as functions.
- feat(Selector): Improved Selector logic for dealing with dependencies caches while it is reading. Now it does not resolve in progress promise if a dependency cache is clean while reading. Instead of that, it will start reading dependencies again in order to ensure last available result is being returned.
- feat(Provider): Add "state", "store" and "stats" getters to allow accessing to state.
- feat(Provider): Add "children" getter, returning all children "queried" instances.
- feat(Provider): Add "parent" getter, returning parent instance in children ones.
- feat(Provider): Add "initialState" option, which allows to determine the initial state.
- feat(Provider): Add "resetStats" and "resetState" methods.
- feat(Provider): Add "queryValue", "queries" and "queryMethods" getters.
- feat(Provider): Add "options" getter.
- feat(providers): Add "config", "cleanCache", "resetState", "resetStats", "on", "onChild", "once" and "onceChild" methods to providers handler, allowing to manage instances groups at a time.
- test(e2e): Add e2e tests using all distributions (umd, cjs and esm), in browser and with nodejs.

### Changed
- feat(Provider): [BREAKING CHANGE] "value" property modified to "data".
- feat(Provider): [BREAKING CHANGE] Tags option now only can be an array.
- feat(providers): [BREAKING CHANGE] Rename "instances" into "providers".
- feat(Provider): [BREAKING CHANGE] Change "clean" method by "cleanCache".
- feat(Provider): [BREAKING CHANGE] Change emitted event names.
- feat(Provider): [BREAKING CHANGE] Change methods names to add listeners. Now there are only available "on", "once", "onChild" and "onceChild". Wilcard "\*" can be used to listen to any event.
- feat(Provider): [BREAKING CHANGE] Provider Class now accepts "id", "options" and "query" arguments (this last one only for internal and plugins usage). All plugins should follow same pattern from now.
- feat(Provider): [BREAKING CHANGE] Custom read method now has to be defined as "readMethod" in plugins.
- feat(Provider): [BREAKING CHANGE] Custom config method now has to be defined as "configMethod" in plugins.
- feat(Provider): [BREAKING CHANGE] Changed "addCustomQuery" method, now called "addQueryMethod".
- feat(Provider): [BREAKING CHANGE] Stop exposing custom query methods in root object. Now can be accessed through "queries" getter.

### Removed
- feat(Provider): [BREAKING CHANGE] Remove support for "create", "update" and "delete" methods. Now have to be added by plugins, if necessary.
- feat(Provider): [BREAKING CHANGE] Remove defaultValue property. Now "initialState" should be used instead.
- chore(deps): Remove lodash dependency.
- feat(Provider): [BREAKING CHANGE] Remove state "getters".
- feat(Selector): [BREAKING CHANGE] Remove "test" getter. Added "selector" and "dependencies" getters as alternatives.

## [1.8.0] - 2020-01-18
### Added
- Add `cleanState` method

### Changed
- Update dependency husky to v4.0.10
- Update dependency babel monorepo to v7.8.3

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
