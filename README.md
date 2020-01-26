[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

## Overview

This package provides a [Data Provider][data-provider-url] for handling memory objects.

* __Data Provider queries__ based on object keys.
* __Reactivity__ to CRUD actions. When a "create", "update" or "delete" method is called over an instance, the cache clean events are dispatched.

### Install

```bash
npm i @data-provider/memory --save
```

## Api

`new Memory(defaultValue[, options || uuid][, options])`
* Arguments
	* defaultValue - _`<Object>`_. Object to be stored. Default value is assigned too at the same time.
	* options - `<Object>` containing properties:
		* queriesDefaultValue - _`<Boolean>`_ If `true`, the default value of queried instances will be the value of the "key" in the query. If not defined, the default value of queried instances will be the full `defaultValue` object.
		* uuid - _`<String>`_ Unique id to assign to returned Data Provider instance. Useful when using [Data Provider `instances` handler][data-provider-instances-docs-url].
		* tags - _`<String> or <Array of Strings>`_ Tags to assign to the instance. Useful when using [Data Provider `instances` handler][data-provider-instances-docs-url]. A "memory" tag will be always added to provided tags by default.

## Methods

### query

`memory.query(key)`
* Arguments
  * key - `<String>` Key of the memory object to be read, updated, created or deleted.

## Cache

All cache will be cleaned when the `update`, `delete` or `create` methods are executed for any specific query.

## Default value

The default value of a "queried" instance will be the complete `defaultValue` object until the "queriesDefaultValue" option is set as `true`, in which case the default value will be the value of the key corresponding to the query:

```js
import { Memory } from "@data-provider/memory";

const fooMemory = new Memory({
  foo: "foo-value",
  var: "var-value"
});

console.log(fooMemory.query("foo").read.value); // {foo: "foo-value", var: "var-value"}

const fooMemory2 = new Memory({
  foo: "foo-value",
  var: "var-value"
}, {
  queriesDefaultValue: true
});

console.log(fooMemory2.query("foo").read.value); // "foo"
```

## Examples

Next example will be easier to understand if you are already familiarized with the [Data Provider][data-provider-url] syntax.

```js
import { Memory } from "@data-provider/memory";

const sessionDetails = new Memory({
  userId: null,
  isLogedIn: false
});

// Pass key to read method
sessionDetails.read("userId").then(userId => {
  console.log(userId);
});

// Pass key as a query
sessionDetails
  .query("userId")
  .read()
  .then(userId => {
    console.log(userId);
  });

sessionDetails.query("isLogedIn").update(true);
```

Use Data Provider Memory objects in combination with Axios Data Provider, and take advantage of the built-in reactivity. Use the memory objects to query the API providers, and, when you update the Memory Object, the API object caches will be cleaned as a consequence:


```js
import { Selector } from "@data-provider/core";
import { Memory } from "@data-provider/memory";
import { Api } from "@data-provider/axios";

const currentAuthor = new Memory({
  id: null
});
const booksCollection = new Api("http://api.library.com/books");

const currentAuthorBooks = new Selector(
  {
    provider: currentAuthor,
    query: () => "id"
  },
  {
    provider: booksCollection,
    query: (query, previousResults) => {
      if (!previousResults[0]) {
        return;
      }
      return {
        queryString: {
          authorId: previousResults[0]
        }
      };
    }
  },
  (currentAuthorId, booksResults) => booksResults
);

// Api request to "http://api.library.com/books". Return all books
currentAuthorBooks.read();

// Api request is not repeated, as query has no changed.
currentAuthorBooks.read();

currentAuthor.query("id").update("foo-author-id");

// Api request now is sent to "http://api.library.com/books?authorId=foo-author-id". Return author books
currentAuthorBooks.read();
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider-url]: https://github.com/data-provider/core
[data-provider-instances-docs-url]: https://github.com/data-provider/core/blob/master/docs/instances/api.md

[coveralls-image]: https://coveralls.io/repos/github/data-provider/memory/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/memory
[travisci-image]: https://travis-ci.com/data-provider/memory.svg?branch=master
[travisci-url]: https://travis-ci.com/data-provider/memory
[last-commit-image]: https://img.shields.io/github/last-commit/data-provider/memory.svg
[last-commit-url]: https://github.com/data-provider/memory/commits
[license-image]: https://img.shields.io/npm/l/@data-provider/memory.svg
[license-url]: https://github.com/data-provider/memory/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@data-provider/memory.svg
[npm-downloads-url]: https://www.npmjs.com/package/@data-provider/memory
[npm-dependencies-image]: https://img.shields.io/david/data-provider/memory.svg
[npm-dependencies-url]: https://david-dm.org/data-provider/memory
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=data-provider-memory&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=data-provider-memory
[release-image]: https://img.shields.io/github/release-date/data-provider/memory.svg
[release-url]: https://github.com/data-provider/memory/releases
