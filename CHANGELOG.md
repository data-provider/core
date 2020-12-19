# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed 
### Removed

## [1.5.1] - 2020-12-19

### Added
- chore(deps): Support all Node.js releases that have not passed their end date

### Changed
- chore(ci): Migrate from Travis CI to github actions

### Fixed 
- fix(usePolling): Use cleanDepedenciesCache instead of cleanCache in first invocation. Pass options to it and do not execute it in case provider is loading (#107)

## [1.5.0] - 2020-11-16
### Added
- feat: Supports passing options to cleanCache methods in usePolling and withPolling

## [1.4.0] - 2020-11-09
### Added
- feat(hocs): Add withDataLoadedError, withDataLoadingError, withDataLoadingErrorComponents, withDataLoadedErrorComponents
- feat(hooks): Add useDataLoadedError, useDataLoadingError
- chore(ci-cd): Check package version on PRs to master
- chore(release): Publish releases to github packages repository

### Changed
- feat(hocs): Deprecate withDataProvider in favour of withDataLoadingError
- feat(hocs): Deprecate withDataProviderBranch in favour of withDataLoadingErrorComponents
- feat(hooks): Deprecate useDataProvider in favour of useDataLoadingError

### Fixed
- fix(#101): Add hoist-non-react-statics to HOCs 

## [1.3.0] - 2020-10-31

### Added
- feat(hocs): Wrap Components displayNames in HOCs

### Changed
- chore(deps): Update dependencies

### Fixed
- fix(usePolling): Do not modify original intervals array when check sorting

## [1.2.0] - 2020-06-21

### Added
- feat(polling): Add usePolling hook and withPolling HOC

### Changed
- chore(deps): Update dependencies

## [1.1.0] - 2020-06-14

### Added
- feat(loaded): Add useLoaded hook and withLoaded HOC
- test(unit): Add unit tests full coverage

### Changed
- chore(deps): Update dependencies
- refactor(useDataProvider): Improve useDataProvider hook performance

### Fixed
- fix(useDataProvider): Removed unused arguments

## [1.0.3] - 2020-05-16

### Changed
- chore(deps): Update dependencies

## [1.0.2] - 2020-04-09

### Changed
- chore(deps): Update dependencies

## [1.0.1] - 2020-03-22

### Changed
- chore(deps): update dependencies

## [1.0.0] - 2020-03-16
### Added
- docs(readme): Add docs

### Changed
- chore(deps): Update @data-provider dependency to v2.0.0
- feat(hooks): useRefresh in useData, useLoading and useError

## [1.0.0-alpha.2] - 2020-02-29
### Added
- feat: Catch read errors
- chore: Lint end-to-end tests react-app code

### Changed
- feat: [BREAKING CHANGE] Pass all component props to provider defined as functions, not only "query" property
- feat: Use useRefresh in "withData", "withError" and "withLoading"

## [1.0.0-alpha.1] - 2020-02-26
### Added
- feat: First pre-release
