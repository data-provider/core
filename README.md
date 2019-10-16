[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# ![Mercury Logo](assets/logos/mercury_wings_orange_100.png) Mercury Browser Storage

## Overview

This package provides Mercury browser localStorage and sessionStorage origins. It "wraps" localStorage and sessionStorage with a [Mercury][mercury-url] interface, providing:

* __Mercury queries__ based on object keys.
* __Reactivity__ to CRUD actions. When a "create", "update" or "delete" method is called over an instance, the cache clean events are dispatched.

### Install

```bash
npm i @xbyorange/mercury-browser-storage --save
```

## Api

* SessionStorage - _`<Class>`_ `new SessionStorage(namespace[, defaultValue])` - Class for instancing mercury objects persisted in the browser sessionStorage.
	* Arguments
		* namespace - _`<String>`_. Namespace to be used in the sessionStorage object, in which the origin data will be persisted.
		* defaultValue - _`<Any>`_ Default value until the first async read is resolved.
* LocalStorage - _`<Class>`_ `new LocalStorage(namespace[, defaultValue])` - Class for instancing mercury objects persisted in the browser localStorage.
	* Arguments
		* namespace - _`<String>`_. Namespace to be used in the localStorage object, in which the origin data will be persisted.
		* defaultValue - _`<Any>`_ Default value until the first async read is resolved.

## Common Methods

### query

`mercuryLocalStorage.query(key)`
* Arguments
  * key - `<String>` Key of the storage object to be read, updated, created or deleted.

## Cache

All cache will be cleaned when the `update`, `delete` or `create` methods are executed for any specific query.

## Examples

Next example will be easier to understand if you are already familiarized with the [mercury][mercury-url] syntax.

```js
import { SessionStorage } from "@xbyorange/mercury-browser-storage";

const sessionDetails = new SessionStorage({
  userId: null,
  isLogedIn: false
});

const userId = await sessionDetails.read("userId");

sessionDetails.query("isLogedIn").update(true)

```

Use Mercury Browser Storage objects in combination with Api Origins, and take advantage of the built-in reactivity. Use the storage objects to query the api origins, and, when you update the storage object, the API object caches will be cleaned as a consequence:


```js
import { LocalStorage } from "@xbyorange/mercury-browser-storage";
import { Api } from "@xbyorange/mercury-api";

const currentAuthor = new LocalStorage({
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
// As current author is stored in localStorage, the next time the page is loaded, the queryString applied to the api will be the same
await currentAuthorBooks.read();

```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[mercury-url]: https://github.com/xbyorange/mercury

[coveralls-image]: https://coveralls.io/repos/github/XbyOrange/mercury-browser-storage/badge.svg
[coveralls-url]: https://coveralls.io/github/XbyOrange/mercury-browser-storage
[travisci-image]: https://travis-ci.com/xbyorange/mercury-browser-storage.svg?branch=master
[travisci-url]: https://travis-ci.com/xbyorange/mercury-browser-storage
[last-commit-image]: https://img.shields.io/github/last-commit/xbyorange/mercury-browser-storage.svg
[last-commit-url]: https://github.com/xbyorange/mercury-browser-storage/commits
[license-image]: https://img.shields.io/npm/l/@xbyorange/mercury-browser-storage.svg
[license-url]: https://github.com/xbyorange/mercury-browser-storage/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@xbyorange/mercury-browser-storage.svg
[npm-downloads-url]: https://www.npmjs.com/package/@xbyorange/mercury-browser-storage
[npm-dependencies-image]: https://img.shields.io/david/xbyorange/mercury-browser-storage.svg
[npm-dependencies-url]: https://david-dm.org/xbyorange/mercury-browser-storage
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=xbyorange-mercury-browser-storage&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=xbyorange-mercury-browser-storage
[release-image]: https://img.shields.io/github/release-date/xbyorange/mercury-browser-storage.svg
[release-url]: https://github.com/xbyorange/mercury-browser-storage/releases