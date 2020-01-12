[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Extensible Data Provider and Selector.

[![Greenkeeper badge](https://badges.greenkeeper.io/data-provider/core.svg)](https://greenkeeper.io/)

## Overview

__Data Provider__ provides an asynchronous CRUD data abstraction layer that can be used to isolate your code from specific methods of different data origins.

Provides:

* __"Provider"__ class from which your own specific provider implementation should extend.
  * __CRUD__. Define different methods for `read`, `create`, `update`, `delete` actions.
  * __Asynchronous__. Three properties are available for each method: `value`, `loading`, `error`.
  * __Queryable__. Applies queries to your CRUD methods using the built-in `query` method.
  * __Chainable__. Queries can be chained, the resultant query will be the extension of all.
  * __Customizable__. Custom queries can be added to the instances.
  * __Cache__. Use built-in cache to avoid the same query being executed more than once if not necessary.
  * __Clean__ cache on demand with the built-in `clean` method.
  * __Events__ emitter.You can add listeners to changes and cache events.
  * __Extensible__. Implement your own providers connectors, or use one of the already existant:
    * [Axios][data-provider-axios-url]
    * [Memory Storage][data-provider-memory-url]
    * [Browser Local Storage][data-provider-browser-storage-url]
    * [Browser Session Storage][data-provider-browser-storage-url]
    * [Prismic CMS][data-provider-prismic-url]
* __"Selector"__ constructor for combining or transforming the result of one or many providers.
  * __Declarative__. Declare which Providers your Selector needs to consume. Data Provider will do the rest for you.
  * __Composable__. Can fetch data from Providers or from another Selectors.
  * __Homogeneus__. Provides exactly the same interface than providers. Consumers don't need to know if they are consuming a Provider or a Selector.
  * __Cache__. Implements a cache that avoids the execution of the same Selector and query more than once.
  * __Reactive__. When one of the related providers cache is cleaned, the Selector cache is cleaned too.
  * __Switchable__. Consumed "provider" can be changed programatically.
  * __Parallellizable__. Can fetch data from declared providers in series or in parallel.
  * __Queryable__. Queries can be applied as in Providers. You can pass the `query` data to providers, or use it in the `parser` function, after all related providers data have been fetched.
* __"instances"__ singleton containing methods for managing all created data-provider instances at a time.
	* __Tags__ Data Provider instances can be tagged to create "management" groups. "Cleaning" cache of all data-provider instances tagged with "api" tag calling to a single method is easy, for example.

## Install

```bash
npm i @data-provider/core --save
```

## A simple example

```js
import { Selector, instances } from "@data-provider/core";
import { Api } from "@data-provider/axios";

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
booksWithAuthors.read();

// Clean cache of books, authors, and booksWithAuthors at a time.
instances.clean();
```

> This example uses the Axios provider, which is not distributed in this package, but can clearly illustrate the usage of a Provider, and the intention of the library.

## Providers

### Examples

> All examples in next docs will use the Axios Provider for a better comprehension of the library intention. Please refer to the [@data-provider/axios][data-provider-axios-url] documentation for further info about the Axios Provider usage.

* [Query](docs/provider/query.md)
* [Events](docs/provider/events.md)

### For especific implementation of Providers, please refer to each correspondant docs:

* [Api][data-provider-axios-url]
* [Memory Storage][data-provider-memory-url]
* [Browser Local Storage][data-provider-browser-storage-url]
* [Browser Session Storage][data-provider-browser-storage-url]
* [Prismic CMS][data-provider-prismic-url]

### Creating a new Provider implementation.

Please read the full [Provider api docs](docs/provider/api.md) to learn how to create providers.

## Selectors

### Usage Examples

> All examples in next docs will use the Axios provider for a better comprehension of the library intention. Please refer to the [@data-provider/axios][data-provider-axios-url] documentation for further info about an Axios provider usage.

* [Asynchronous mutable properties](docs/selector/asynchronous-mutable-properties.md)
* [Default value](docs/selector/default-value.md)
* [Cache](docs/selector/cache.md)
* [Query](docs/selector/query.md)
* [Parallel providers](docs/selector/parallel-providers.md)
* [Providers error handling](docs/selector/providers-error-handling.md)
* [Selectors returning providers](docs/selector/selectors-returning-providers.md)

### Api

Read the full [Selector API documentation](docs/selector/api.md).

### Unit testing

Some utilities are provided to make easier the task of testing Selectors. Please red the [testing selectors docs](docs/selector/testing.md).

## Instances

All created Providers Selectors are registered in the "instances" object, which provides methods for managing them all together, or by groups based in tags.

### A simple example

```js
import { instances } from "@data-provider/core";

instances.clean();

instances.getByTag("need-auth").config({
  headers: {
    authentication: "foo"
  }
});
```

### Api

Read the full [instances API documentation](docs/instances/api.md).

## Connectors

Data Provider provides connectors to easily binding your data providers and selectors to:

### React

Please refer to the [@data-provider/connector-react][data-provider-connector-react-url] documentation to see how simple is the data-binding between React Components and Data Provider.

Connects a Provider or Selector to all components that need it. Data Provider will fetch data only when needed, and will avoid making it more than once, no matter how many components need the data.

Components will became reactive to CRUD actions automatically (dispatch a `create` action over a collection, and Data Provider will refresh it automatically on any rendered binded component)

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider-axios-url]: https://github.com/data-provider/axios
[data-provider-memory-url]: https://github.com/data-provider/memory
[data-provider-browser-storage-url]: https://github.com/data-provider/browser-storage
[data-provider-prismic-url]: https://github.com/data-provider/prismic
[data-provider-connector-react-url]: https://github.com/data-provider/connector-react

[coveralls-image]: https://coveralls.io/repos/github/data-provider/core/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/core
[travisci-image]: https://travis-ci.com/data-provider/core.svg?branch=master
[travisci-url]: https://travis-ci.com/data-provider/core
[last-commit-image]: https://img.shields.io/github/last-commit/data-provider/core.svg
[last-commit-url]: https://github.com/data-provider/core/commits
[license-image]: https://img.shields.io/npm/l/@data-provider/core.svg
[license-url]: https://github.com/data-provider/core/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@data-provider/core.svg
[npm-downloads-url]: https://www.npmjs.com/package/@data-provider/core
[npm-dependencies-image]: https://img.shields.io/david/data-provider/core.svg
[npm-dependencies-url]: https://david-dm.org/data-provider/core
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=data-provider-core&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=data-provider-core
[release-image]: https://img.shields.io/github/release-date/data-provider/core.svg
[release-url]: https://github.com/data-provider/core/releases
