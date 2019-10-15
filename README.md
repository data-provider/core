[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# ![Mercury Logo](assets/logos/mercury_wings_orange_100.png) Mercury Prismic

## Overview

This package provides a [Mercury][mercury-url] origin for reading data from Prismic CMS API. As underlay, it uses the [prismic-javascript][prismic-javascript-url] client to provide the Prismic data.

## Api

`import { Prismic } from "@xbyorange/mercury-prismic"`

`new Prismic(url, options)`
* Arguments
	* url - _`<String>`_. Prismic api url.
	* options - _`<Object>`_ Containing options:
		* defaultValue - _`<Any>`_ Default value of origin until real data is returned.
		* fullResponse - _`<Boolean>`_ If `true`, the full response of the Prismic api will be used as value. If `false`, only the `response.results` property will be returned, which is the default behavior.
		* release - _`<String>`_ Prismic release to be read. This parameter will be passed as `ref` to the [prismic-javascript][prismic-javascript-url] query.
		* uuid - _`<String>`_ Unique id to assign to the instance. Useful when using [mercury `sources` handler][mercury-sources-docs-url].
		* tags - _`<String> or <Array of Strings>`_ Tags to assign to the instance. Useful when using [mercury `sources` handler][mercury-sources-docs-url]. A "prismic" tag will be always added to provided tags by default.

## Methods

### query

`prismic.query(queryObject)`
* Arguments
	* queryObject - `<Object>` containing properties:
		* documentType - `<String>` Prismic document type to filter by. (It will be used to build a [prismic-javascript][prismic-javascript-url] query as in `PrismicJs.Predicates.at("document.type", documentType)`)
* Returns - New queried instance having all common [Mercury][mercury-url] methods.

### config

Configure instance for all next `read` executions.

`prismic.config(options)`
* Arguments
	* options - `<Object>` containing properties:
		* url - _`<String>`_ Prismic api url.
		* fullResponse - _`<Boolean>`_ If `true`, the full response of the Prismic api will be used as value. If `false`, only the `response.results` property will be returned, which is the default behavior.
		* release - _`<String>`_ Prismic release to be read. This parameter will be passed as `ref` to the [prismic-javascript][prismic-javascript-url] query.

Read about how to configure all mercury-prismic instances at a time using the [mercury `sources` handler][mercury-sources-docs-url].

Example of how to change all `mercury-api` requests urls at a time:

```js
import { sources } from "@xbyorange/mercury";

sources.getByTag("prismic").config({
  url: "https://foo-prismic-repository.cdn.prismic.io/api/v2"
});

// All mercury-prismic instances will now be configured to request to provided url.
```

## Example

Next example will be easier to understand if you are already familiarized with the [mercury][mercury-url] syntax.

```js
import { Prismic } from "@xbyorange/mercury-prismic";

const prismic = new Prismic("https://foo-prismic-repository.cdn.prismic.io/api/v2", {
  release: "foo-release"
});

prismic
  .query({ documentType: "home-banner" })
  .read()
  .then(results => {
    console.log("Prismic content for home banner in foo-release", results);
  });
```

## Usage with frameworks

### React

Please refer to the [react-mercury][react-mercury-url] documentation to see how simple is the data-binding between React Components and Mercury Prismic.

Connect a source to all components that need it. Mercury will fetch data only when needed, and will avoid making it more than once, no matter how many components need the data.

[mercury-url]: https://github.com/xbyorange/mercury
[mercury-sources-docs-url]: https://github.com/XbyOrange/mercury/blob/master/docs/sources/api.md
[prismic-javascript-url]: https://www.npmjs.com/package/prismic-javascript
[react-mercury-url]: https://github.com/xbyorange/react-mercury

[coveralls-image]: https://coveralls.io/repos/github/XbyOrange/mercury-prismic/badge.svg
[coveralls-url]: https://coveralls.io/github/XbyOrange/mercury-prismic
[travisci-image]: https://travis-ci.com/xbyorange/mercury-prismic.svg?branch=master
[travisci-url]: https://travis-ci.com/xbyorange/mercury-prismic
[last-commit-image]: https://img.shields.io/github/last-commit/xbyorange/mercury-prismic.svg
[last-commit-url]: https://github.com/xbyorange/mercury-prismic/commits
[license-image]: https://img.shields.io/npm/l/@xbyorange/mercury-prismic.svg
[license-url]: https://github.com/xbyorange/mercury-prismic/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@xbyorange/mercury-prismic.svg
[npm-downloads-url]: https://www.npmjs.com/package/@xbyorange/mercury-prismic
[npm-dependencies-image]: https://img.shields.io/david/xbyorange/mercury-prismic.svg
[npm-dependencies-url]: https://david-dm.org/xbyorange/mercury-prismic
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=xbyorange-mercury-prismic&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=xbyorange-mercury-prismic
[release-image]: https://img.shields.io/github/release-date/xbyorange/mercury-prismic.svg
[release-url]: https://github.com/xbyorange/mercury-prismic/releases


