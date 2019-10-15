[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# ![Mercury Logo](assets/logos/mercury_wings_orange_100.png) Mercury Memory

## Overview

This package provides a Mercury origin for handling memory objects.

* __Mercury queries__ based on object keys.
* __Reactivity__ to CRUD actions. When a "create", "update" or "delete" method is called over an instance, the cache clean events are dispatched.

### Install

```bash
npm i @xbyorange/mercury-memory --save
```

## Api

`new Memory(defaultValue[, options || uuid][, options])`
* Arguments
	* defaultValue - _`<Object>`_. Object to be stored. Default value is assigned too at the same time.
	* uuid - _`<String>`_. Unique id to assign to returned Mercury instance. Useful when using [mercury `sources` handler][mercury-sources-docs-url]. __To be deprecated in next releases. Options object should be passed as second argument instead of uuid.__
	* options - `<Object>` containing properties:
		* useLegacyDefaultValue - _`<Boolean>`_ If `true`, the default value of queried sources will be the full `defaultValue` object. If not provided, the default value of queried sources will be the value of the "key" in the query.
		* uuid - _`<String>`_ Unique id to assign to returned Mercury instance. Useful when using [mercury `sources` handler][mercury-sources-docs-url].
		* tags - _`<String> or <Array of Strings>`_ Tags to assign to the instance. Useful when using [mercury `sources` handler][mercury-sources-docs-url]. A "memory" tag will be always added to provided tags by default.

## Methods

### query

`memory.query(key)`
* Arguments
  * key - `<String>` Key of the memory object to be read, updated, created or deleted.

### cache

All cache will be cleaned when the `update`, `delete` or `create` methods are executed for any specific query.


## Examples

Next example will be easier to understand if you are already familiarized with the [mercury][mercury-url] syntax.

```js
import { Memory } from "@xbyorange/mercury-memory";

const sessionDetails = new Memory({
  userId: null,
  isLogedIn: false
});

const userId = await sessionDetails.read("userId");

sessionDetails.query("isLogedIn").update(true)

```

Use Mercury Memory objects in combination with Api Origins, and take advantage of the built-in reactivity. Use the memory objects to query the api origins, and, when you update the Memory Object, the API object caches will be cleaned as a consequence:


```js
import { Memory } from "@xbyorange/mercury-memory";
import { Api } from "@xbyorange/mercury-api";

const currentAuthor = new Memory({
  id: null
});
const booksCollection = new Api("http://api.library.com/books");

const currentAuthorBooks = new Selector(
  { 
    source: currentAuthor,
    query: () => "id"
  },
  {
    source: booksCollection,
    query: (query, previousResults) => {
      if(!previousResults[0]) {
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
await currentAuthorBooks.read();

// Api request is not repeated, as query has no changed.
await currentAuthorBooks.read();

currentAuthor.query("id").update("foo-author-id");

// Api request now is sent to "http://api.library.com/books?authorId=foo-author-id". Return author books
await currentAuthorBooks.read();

```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[mercury-url]: https://github.com/xbyorange/mercury
[mercury-sources-docs-url]: https://github.com/XbyOrange/mercury/blob/master/docs/sources/api.md

[coveralls-image]: https://coveralls.io/repos/github/XbyOrange/mercury-memory/badge.svg
[coveralls-url]: https://coveralls.io/github/XbyOrange/mercury-memory
[travisci-image]: https://travis-ci.com/xbyorange/mercury-memory.svg?branch=master
[travisci-url]: https://travis-ci.com/xbyorange/mercury-memory
[last-commit-image]: https://img.shields.io/github/last-commit/xbyorange/mercury-memory.svg
[last-commit-url]: https://github.com/xbyorange/mercury-memory/commits
[license-image]: https://img.shields.io/npm/l/@xbyorange/mercury-memory.svg
[license-url]: https://github.com/xbyorange/mercury-memory/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@xbyorange/mercury-memory.svg
[npm-downloads-url]: https://www.npmjs.com/package/@xbyorange/mercury-memory
[npm-dependencies-image]: https://img.shields.io/david/xbyorange/mercury-memory.svg
[npm-dependencies-url]: https://david-dm.org/xbyorange/mercury-memory
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=xbyorange-mercury-memory&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=xbyorange-mercury-memory
[release-image]: https://img.shields.io/github/release-date/xbyorange/mercury-memory.svg
[release-url]: https://github.com/xbyorange/mercury-memory/releases
