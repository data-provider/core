[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Reactive CRUD data abstraction layer

![Mercury Logo](assets/logos/mercury_name_black_500.png)

## Overview

__Mercury__ provides an asynchronous CRUD data abstraction layer that can be used to isolate your code from specific methods of different data origins.

Provides:

* __"Origin"__ class from which your own specific origin implementation should extend.
  * __CRUD__. Define different methods for `read`, `create`, `update`, `delete` actions.
  * __Asynchronous__. Three properties are available for each method: `value`, `loading`, `error`.
  * __Queryable__. Applies queries to your CRUD methods using the built-in `query` method.
  * __Chainable__. Queries can be chained, the resultant query will be the extension of all.
  * __Customizable__. Custom queries can be added to the instances.
  * __Cache__. Use built-in cache to avoid the same query being executed more than once if not necessary.
  * __Clean__ cache on demand with the built-in `clean` method.
  * __Events__ emitter.You can add listeners to changes and cache events.
  * __Extensible__. Implement your own origins connectors, or use one of the already existant:
    * [Api][mercury-api-url]
    * [Memory Storage][mercury-memory-url]
    * [Browser Local Storage][mercury-browser-storage-url]
    * [Browser Session Storage][mercury-browser-storage-url]
    * [Prismic CMS][mercury-prismic-url]
* __"Selector"__ constructor for combining or transforming the result of one or many origins.
  * __Declarative__. Declare which Origins your Selector needs to consume. Mercury will do the rest for you.
  * __Composable__. Can fetch data from Origins or from another Selectors.
  * __Homogeneus__. Provides exactly the same interface than origins. Consumers don't need to know if they are consuming an Origin or a Selector.
  * __Cache__. Implements a cache that avoids the execution of the same Selector and query more than once.
  * __Reactive__. When one of the related sources cache is cleaned, the Selector cache is cleaned too.
  * __Switchable__. Consumed "source" can be changed programatically.
  * __Parallellizable__. Can fetch data from declared sources in series or in parallel.
  * __Queryable__. Queries can be applied as in Origins. You can pass the `query` data to sources, or use it in the `parser` function, after all related sources data have been fetched.
* __"sources"__ singleton containing methods for managing all created mercury sources at a time.
	* __Tags__ Mercury instances can be tagged to create "management" groups. "Cleaning" cache of all mercury sources tagged with "api" tag calling to a single method is easy, for example.

## Install

```bash
npm i @xbyorange/mercury --save
```

## A simple example

```js
import { Selector, sources } from "@xbyorange/mercury";
import { Api } from "@xbyorange/mercury-api";

const booksCollection = new Api("http://api.library.com/books");
const authorsCollection = new Api("http://api.library.com/authors");

const booksWithAuthors = new Selector(
  booksCollection,
  authorsCollection,
  (booksResults, authorsResults) =>
      booksResults.map(book => ({
      ...book,
      authorName: authorsResults.find(author => author.id === book.author)
    }))
);

// Each book now includes an "authorName" property.
const results = await booksWithAuthors.read();

// Clean cache of books, authors, and booksWithAuthors at a time.
sources.clean();
```

> This example uses the Api origin, which is not distributed in this package, but can clearly illustrate the usage of an Origin, and the intention of the library.

## Origins

### Examples

> All examples in next docs will use the Api origin for a better comprehension of the library intention. Please refer to the [mercury-api][mercury-api-url] documentation for further info about an API origin usage.

* [Query](docs/origin/query.md)
* [Events](docs/origin/events.md)

### For especific implementation of Origins, please refer to each correspondant docs:

* [Api][mercury-api-url]
* [Memory Storage][mercury-memory-url]
* [Browser Local Storage][mercury-browser-storage-url]
* [Browser Session Storage][mercury-browser-storage-url]
* [Prismic CMS][mercury-prismic-url]

### Creating a new Origin implementation.

Please read the full [Origin api docs](docs/origin/api.md) to learn how to create origins.

## Selectors

### Usage Examples

> All examples in next docs will use the Api origin for a better comprehension of the library intention. Please refer to the [mercury-api][mercury-api-url] documentation for further info about an API origin usage.

* [Asynchronous mutable properties](docs/selector/asynchronous-mutable-properties.md)
* [Default value](docs/selector/default-value.md)
* [Cache](docs/selector/cache.md)
* [Query](docs/selector/query.md)
* [Parallel sources](docs/selector/parallel-sources.md)
* [Sources error handling](docs/selector/sources-error-handling.md)
* [Selectors returning sources](docs/selector/selectors-returning-sources.md)

### Api

Read the full [Selector API documentation](docs/selector/api.md).

### Unit testing

Some utilities are provided to make easier the task of testing Selectors. Please red the [testing selectors docs](docs/selector/testing.md).

## Sources

All created Mercury origins or selectors are registered in the "sources" object, which provides methods for managing them all together, or by groups based in tags.

### A simple example

```js
import { sources } from "@xbyorange/mercury";

sources.clean();

sources.getByTag(["api", "need-auth"]).setHeaders({
  authentication: "foo-auth"
})
```

### Api

Read the full [sources API documentation](docs/sources/api.md).

## Usage with frameworks

### React

Please refer to the [react-mercury][react-mercury-url] documentation to see how simple is the data-binding between React Components and the Mercury Sources.

Connect a source to all components that need it. Mercury will fetch data only when needed, and will avoid making it more than once, no matter how many components need the data.

Components will became reactive to CRUD actions automatically (dispatch a `create` action over a collection, and Mercury will refresh it automatically on any rendered binded component)

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[mercury-api-url]: https://github.com/xbyorange/mercury-api
[mercury-memory-url]: https://github.com/xbyorange/mercury-memory
[mercury-browser-storage-url]: https://github.com/xbyorange/mercury-browser-storage
[mercury-prismic-url]: https://github.com/xbyorange/mercury-prismic
[react-mercury-url]: https://github.com/xbyorange/react-mercury

[coveralls-image]: https://coveralls.io/repos/github/XbyOrange/mercury/badge.svg
[coveralls-url]: https://coveralls.io/github/XbyOrange/mercury
[travisci-image]: https://travis-ci.com/xbyorange/mercury.svg?branch=master
[travisci-url]: https://travis-ci.com/xbyorange/mercury
[last-commit-image]: https://img.shields.io/github/last-commit/xbyorange/mercury.svg
[last-commit-url]: https://github.com/xbyorange/mercury/commits
[license-image]: https://img.shields.io/npm/l/@xbyorange/mercury.svg
[license-url]: https://github.com/xbyorange/mercury/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@xbyorange/mercury.svg
[npm-downloads-url]: https://www.npmjs.com/package/@xbyorange/mercury
[npm-dependencies-image]: https://img.shields.io/david/xbyorange/mercury.svg
[npm-dependencies-url]: https://david-dm.org/xbyorange/mercury
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=xbyorange-mercury&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=xbyorange-mercury
[release-image]: https://img.shields.io/github/release-date/xbyorange/mercury.svg
[release-url]: https://github.com/xbyorange/mercury/releases
