[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

## Overview

This package provides browser localStorage and sessionStorage Data Providers.

* __Data Provider queries__ based on object keys.
* __Reactivity__ to CRUD actions. When a "create", "update" or "delete" method is called over an instance, the cache clean events are dispatched.

### Install

```bash
npm i @data-provider/browser-storage --save
```

## Api

* SessionStorage - _`<Class>`_ `new SessionStorage(namespace[, defaultValue[, options]])` - Class for instancing Data Provider objects persisted in the browser sessionStorage.
	* Arguments
		* namespace - _`<String>`_. Namespace to be used in the sessionStorage object, in which the provider data will be persisted.
		* defaultValue - _`<Any>`_ Default value until the first async read is resolved.
		* options - `<Object>` containing properties:
			* queriesDefaultValue - _`<Boolean>`_ If `true`, the default value of queried instances will be the value of the "key" in the query. If not defined, the default value of queried instances will be the full `defaultValue` object.
			* tags - _`<String> or <Array of Strings>`_ Tags to assign to the instance. Useful when using [Data Provider `instances` handler][data-provider-instances-docs-url]. Tags "browser-storage" and "session-storage" will be always added to provided tags by default.
* LocalStorage - _`<Class>`_ `new LocalStorage(namespace[, defaultValue[, options]])` - Class for instancing Data Provider objects persisted in the browser localStorage.
	* Arguments
		* namespace - _`<String>`_. Namespace to be used in the localStorage object, in which the provider data will be persisted.
		* defaultValue - _`<Any>`_ Default value until the first async read is resolved.
		* options - `<Object>` containing properties:
			* queriesDefaultValue - _`<Boolean>`_ If `true`, the default value of queried instances will be the value of the "key" in the query. If not defined, the default value of queried instances will be the full `defaultValue` object.
			* tags - _`<String> or <Array of Strings>`_ Tags to assign to the instance. Useful when using [Data Provider `instances` handler][data-provider-instances-docs-url]. Tags "browser-storage" and "local-storage" will be always added to provided tags by default.

## Common Methods

### query

`dataProviderLocalStorage.query(key)`
* Arguments
  * key - `<String>` Key of the storage object to be read, updated, created or deleted.

## Cache

All cache will be cleaned when the `update`, `delete` or `create` methods are executed for any specific query.

## Examples

Next example will be easier to understand if you are already familiarized with the [Data Provider][data-provider-url] syntax.

```js
import { SessionStorage } from "@data-provider/browser-storage";

const sessionDetails = new SessionStorage("user", {
  id: null,
  isLogedIn: false
});

sessionDetails.query("id").read();

sessionDetails.query("isLogedIn").update(true);
```

Use Data Provider Browser Storage objects in combination with Axios Data Provider, and take advantage of the built-in reactivity. Use the storage objects to query the Axios providers, and, when you update the storage object, the API object caches will be cleaned as a consequence:


```js
import { Selector } from "@data-provider/core";
import { LocalStorage } from "@data-provider/browser-storage";
import { Api } from "@data-provider/axios";

const currentAuthor = new LocalStorage("current-author", {
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
// As current author is stored in localStorage, the next time the page is loaded, the queryString applied to the api will be the same
currentAuthorBooks.read();
```

## Usage with frameworks

### React

Please refer to the [@data-provider/connector-react][data-provider-connector-react-url] documentation to see how simple is the data-binding between React Components and Data Provider Browser Storage.

Connect a provider to all components that need it. Data Provider will rerender automatically connected components when data in providers is updated.

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider-url]: https://github.com/data-provider/core
[data-provider-instances-docs-url]: https://github.com/data-provider/core/blob/master/docs/instances/api.md
[data-provider-connector-react-url]: https://github.com/data-provider/connector-react

[coveralls-image]: https://coveralls.io/repos/github/data-provider/browser-storage/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/browser-storage
[travisci-image]: https://travis-ci.com/data-provider/browser-storage.svg?branch=master
[travisci-url]: https://travis-ci.com/data-provider/browser-storage
[last-commit-image]: https://img.shields.io/github/last-commit/data-provider/browser-storage.svg
[last-commit-url]: https://github.com/data-provider/browser-storage/commits
[license-image]: https://img.shields.io/npm/l/@data-provider/browser-storage.svg
[license-url]: https://github.com/data-provider/browser-storage/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@data-provider/browser-storage.svg
[npm-downloads-url]: https://www.npmjs.com/package/@data-provider/browser-storage
[npm-dependencies-image]: https://img.shields.io/david/data-provider/browser-storage.svg
[npm-dependencies-url]: https://david-dm.org/data-provider/browser-storage
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=data-provider-browser-storage&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=data-provider-browser-storage
[release-image]: https://img.shields.io/github/release-date/data-provider/browser-storage.svg
[release-url]: https://github.com/data-provider/browser-storage/releases
