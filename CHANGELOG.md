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
- apis "config" and "clean" methods. Mercury "instances" methods should be used instead.

## [1.5.0] - 2019-11-24
### Changed
- Upgrade @data-provider/core dependency

## [1.4.0] - 2019-11-23
### Changed
- Project migration. Read NOTICE for further info. All previous releases in this CHANGELOG file correspond to @xbyorange/mercury-api package distribution.
 
## [1.3.0] - 2019-10-18
### Changed
- Upgrade mercury version. Use mercury "sources" methods from "apis" methods. Keep "apis" methods due to retrocompatibility.
- Downgrade axios minor version to 0.18.0 until axios-retry fix issue https://github.com/softonic/axios-retry/issues/59

### Fixed
- Fix "retry" option.

## [1.2.0] - 2019-06-28
### Changed
- Upgrade mercury version

## [1.1.0] - 2019-06-10
### Added
- Add `apis` method, which allows to configure, manage headers or clean multiple apis at a time. Groups of apis can be defined using new config property called `tags`.

### Changed
- Upgrade dependencies

## [1.0.1] - 2019-06-03
### Fixed
- Upgrade Axios dependency to fix a potential vulnerability.
- Fix events unit test.

## [1.0.0] - 2019-06-03
### BREAKING CHANGES
- Forked from xByOrange reactive-data-source v1.7.0 library. (Only origins.Api is exposed from now)
- Extends from Mercury Origin instead of reactive-data-source origin. (Refer to mercury CHANLEGOG for further details)
- Removed methods option. Now constructor accepts only two arguments.

### Changed
- query and params becomes queryString and urlParams. Old keys are maintained for retrocompatibility.
