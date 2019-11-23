[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

## Overview

This package provides a [Data Provider][data-provider-url] origin for reading data from Prismic CMS API. As underlay, it uses the [prismic-javascript][prismic-javascript-url] client to provide the Prismic data.

## Api

`import { Prismic } from "@data-provider/prismic"`

`new Prismic(url, options)`
* Arguments
	* url - _`<String>`_. Prismic api url.
	* options - _`<Object>`_ Containing options:
		* defaultValue - _`<Any>`_ Default value of origin until real data is returned.
		* fullResponse - _`<Boolean>`_ If `true`, the full response of the Prismic api will be used as value. If `false`, only the `response.results` property will be returned, which is the default behavior.
		* release - _`<String>`_ Prismic release to be read. This parameter will be passed as `ref` to the [prismic-javascript][prismic-javascript-url] query.
		* uuid - _`<String>`_ Unique id to assign to the instance. Useful when using [Data Provider `sources` handler][data-provider-sources-docs-url].
		* tags - _`<String> or <Array of Strings>`_ Tags to assign to the instance. Useful when using [Data Provider `sources` handler][data-provider-sources-docs-url]. A "prismic" tag will be always added to provided tags by default.

## Methods

### query

`prismic.query(queryObject)`
* Arguments
	* queryObject - `<Object>` containing properties:
		* documentType - `<String>` Prismic document type to filter by. (It will be used to build a [prismic-javascript][prismic-javascript-url] query as in `PrismicJs.Predicates.at("document.type", documentType)`)
* Returns - New queried instance having all common [Data Provider][data-provider-url] methods.

### config

Configure instance for all next `read` executions.

`prismic.config(options)`
* Arguments
	* options - `<Object>` containing properties:
		* url - _`<String>`_ Prismic api url.
		* fullResponse - _`<Boolean>`_ If `true`, the full response of the Prismic api will be used as value. If `false`, only the `response.results` property will be returned, which is the default behavior.
		* release - _`<String>`_ Prismic release to be read. This parameter will be passed as `ref` to the [prismic-javascript][prismic-javascript-url] query.

Read about how to configure all @data-provider/prismic instances at a time using the [Data Provider `sources` handler][data-provider-sources-docs-url].

Example of how to change all `@data-provider/prismic` requests urls at a time:

```js
import { sources } from "@data-provider/core";

sources.getByTag("prismic").config({
  url: "https://foo-prismic-repository.cdn.prismic.io/api/v2"
});

// All @data-provider/prismic instances will now be configured to request to provided url.
```

## Example

Next example will be easier to understand if you are already familiarized with the [Data Provider][data-provider-url] syntax.

```js
import { Prismic } from "@data-provider/prismic";

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

Please refer to the [@data-provider/connector-react][data-provider-connector-react-url] documentation to see how simple is the data-binding between React Components and @data-provider/prismic.

Connect a source to all components that need it. Data Provider will fetch data only when needed, and will avoid making it more than once, no matter how many components need the data.

[data-provider-url]: https://github.com/data-provider/core
[data-provider-sources-docs-url]: https://github.com/data-provider/core/blob/master/docs/sources/api.md
[prismic-javascript-url]: https://www.npmjs.com/package/prismic-javascript
[data-provider-connector-react-url]: https://github.com/data-provider/connector-react

[coveralls-image]: https://coveralls.io/repos/github/data-provider/prismic/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/prismic
[travisci-image]: https://travis-ci.com/data-provider/prismic.svg?branch=master
[travisci-url]: https://travis-ci.com/data-provider/prismic
[last-commit-image]: https://img.shields.io/github/last-commit/data-provider/prismic.svg
[last-commit-url]: https://github.com/data-provider/prismic/commits
[license-image]: https://img.shields.io/npm/l/@data-provider/prismic.svg
[license-url]: https://github.com/data-provider/prismic/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@data-provider/prismic.svg
[npm-downloads-url]: https://www.npmjs.com/package/@data-provider/prismic
[npm-dependencies-image]: https://img.shields.io/david/data-provider/prismic.svg
[npm-dependencies-url]: https://david-dm.org/data-provider/prismic
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=data-provider-prismic&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=data-provider-prismic
[release-image]: https://img.shields.io/github/release-date/data-provider/prismic.svg
[release-url]: https://github.com/data-provider/prismic/releases


