[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fdata-provider%2Faxios%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/data-provider/axios/master)

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Data Provider Axios origin addon

This [Data Provider][data-provider] addon provides an API REST data origin using [Axios][axios].

## Usage

Read the [Data Provider][data-provider] docs to learn how to use addons.

* [Home][data-provider]
* [Get started][get-started]
* [Basic tutorial][basic-tutorial]

## Options

Apart of the common Data Provider options, next ones are available:

* `url` _(String)_: Url of the API resource.
* `baseUrl` _(String)_: Added as prefix to the `url` option.
* `createVerb` _(String)_: HTTP verb to be used in axios requests for create method.
* `readVerb` _(String)_: HTTP verb to be used in axios requests for read method.
* `updateVerb` _(String)_: HTTP verb to be used in axios requests for update method.
* `deleteVerb` _(String)_: HTTP verb to be used in axios requests for delete method.
* `authErrorStatus` _(Number)_: Status code that will be considered as an authentication error. When detected, the authErrorHandler function will be executed instead of returning an error.
* `authErrorHandler` _(Function)_: Handler that will be executed when an authentication error is received.
	* Arguments:
		* `provider` _(Object)_: provider instance As first argument, the function will receive the provider itself. This will allow to set custom authentication headers after executing login, as example.
		* `retry` _(Function)_: As second argument, a retry function is received, it has to be executed in order to retry the authentication failed request.
	* Returns: This function should return a Promise rejected with an error, or the execution of the received retry method.
* `onBeforeRequest` _(Function)_: Handler that will be executed before any request method. Useful, for example, to set provider headers just before each request is executed.
	* Arguments:
		* `provider` _(Object)_: provider instance As first argument, the function will receive the provider itself.
* `onceBeforeRequest` _(Function)_: Handler that will be executed once time just before the first request. Useful to set provider configuration, for example.
	*	Arguments:
		* `provider` _(Object)_: provider instance As first argument, the function will receive the provider itself.
* `expirationTime` _(Number)_: The cache will be automatically cleaned each expirationTime miliseconds.
* `retries` _(Number)_: Number of retries that will be executed when a request fails before definitively failing. Requests will be retried for network errors or a 5xx error on an idempotent request (GET, PUT, PATCH, DELETE).
* `fullResponse` _(Boolean)_: If true, the full response object will be used as value, so you can consult headers, etc. If false, only the response.data will be returned, which is the default behavior.
* `validateStatus` _(Function)_: Function that will be used to determine if response status has to be considered as failed or success.
	* Arguments:
		* `status` _(Number)_: Status code of the request.
	* Returns: Should return true for success requests, and false for failed ones.
* `validateResponse` _(Function)_: Function that will be used to determine if response has to be considered as failed or success.
	* Arguments:
		* `response` _(Object)_: Response of the request.
	* Returns: Should return a Promise resolves for success requests, and a Promise rejected with an error for failed ones.
* `errorHandler` _(Function)_: Function used to parse errors. The returned value will be setted as error in the provider error property.
	* Arguments:
		* `error` _(Error)_: Error object produced by a failed request.
	* Returns: Should return a rejected Promise, containing the new Error.

## Queries

When querying providers created with this addon, the query object can have one of the next properties:

* `queryString` _(Object)_: Object containing all query string parameters to send in the request.
* `urlParams` _(Object)_: Keys of the object will be replaced by correspondant url parameters defined in the url as ":param". Please refer to the [path-to-regexp][path-to-regex] package for further info.

> When chaining provider queries, the `queryString` and `urlParams` objects will be extended with the previous ones

### Examples

`urlParams` example:

```javascript
import { Axios } from "@data-provider/axios";

const booksModel = new Axios({
  id: "books-model",
  url: "/books/:id",
  baseUrl: "http://foo.api.com"
});

// GET http://foo.api.com/books/2
booksModel.query({
  urlParams: {
    id: 2
  }
}).read();
```

`queryString` example:
```javascript
import { Axios } from "@data-provider/axios";

const booksCollection = new Axios({
  id: "books-collection",
  url: "/books/:id",
  baseUrl: "http://foo.api.com"
});

// GET http://foo.api.com/books/?author=2
booksCollection.query({
  queryString: {
    author: 2
  }
}).read();
```

Chainability example:
```javascript
const author2Books = booksCollection.query({
  queryString: {
    author: 2
  }
});

// GET http://foo.api.com/books/?author=2&page=1
author2Books.query({
  queryString: {
    page: 1
  }
}).read();
```

## Custom methods

Apart of the common Data Provider methods, next ones are available:

### `create(data)`

Sends a "create" request. By default, it will use the `POST` HTTP verb, but this behavior can be changed using the `createVerb` option. It emits a `createSuccess` event when the request finish successfully, and __automatically cleans the cache of the provider__.

#### Arguments

* `data` _(Object)_: Data to be sent as request body.

#### Example

```javascript
booksCollection.create({
  title: "1984"
});
```

### `update(data)`

Sends an "update" request. By default, it will use the `PATCH` HTTP verb, but this behavior can be changed using the `updateVerb` option. It emits an `updateSuccess` event when the request finish successfully, and __automatically cleans the cache of the provider__.

#### Arguments

* `data` _(Object)_: Data to be sent as request body.

#### Example

```javascript
booksCollection.query({
  queryString: {
    id: 2
  }
}).update({
  title: "Fahrenheit 451"
});
```

### `delete(data)`
Sends a "delete" request. By default, it will use the `DELETE` HTTP verb, but this behavior can be changed using the `deleteVerb` option. It emits an `deleteSuccess` event when the request finish successfully, and __automatically cleans the cache of the provider__.

#### Arguments

* `data` _(Object)_: Optional. Data to be sent as request body.

#### Examples

With no request body
```javascript
booksCollection.query({
  queryString: {
    id: 2
  }
}).delete();
```

With request body
```javascript
booksCollection.query().delete({ id: 2 });
```

> When cleaning the cache after a successful request, all methods use the `force` option under the hood, so the cache will be cleaned inmediately, no matter the `cleanCacheThrottle` option configured for the provider, as the resource should have changed in the API also inmediatly.

### `setHeaders(headers)`

Defines headers that will be applied to all subsequent requests.

#### Arguments

* `headers` _(Object)_: Each property in the object will be applied as a request header.

#### Example

```javascript
booksCollection.setHeaders({
  "Cache-Control": "no-cache"
});
```

### `addHeaders(headers)`

Add a new header. Current headers will be extended with received headers object, and applied to all subsequent requests:

#### Arguments

* `headers` _(Object)_: Each property in the object will be applied as a request header.

#### Example

```javascript
booksCollection.addHeaders({
  Authorization: `Bearer ${token}`
});
```

## Custom Events

Apart of the common events emitted by any Data Provider origin, this addon emits extra events when some custom methods are executed successfully.

Event names are available at the top-level export `eventNames`:

* eventNames.CREATE_SUCCESS: Emitted when the `create` method finish successfully.
* eventNames.UPDATE_SUCCESS: Emitted when the `update` method finish successfully.
* eventNames.DELETE_SUCCESS: Emitted when the `delete` method finish successfully.

#### Example

```javascript
import { eventNames } from "@data-provider/axios";

booksCollection.on(eventNames.CREATE_SUCCESS, () => {
  console.log("A book was created!");
});
```

## Tags

Providers created with this addon will have automatically the `axios` tag, so you can select all of them together using the `providers` methods as in:

```javascript
import { providers } from "@data-provider/core";

providers.getByTag("axios").cleanCache();
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider-url]: https://github.com/data-provider/core
[data-provider-connector-react-url]: https://github.com/data-provider/connector-react
[data-provider-instances-docs-url]: https://github.com/data-provider/core/blob/master/docs/instances/api.md
[path-to-regex]: https://www.npmjs.com/package/path-to-regexp

[data-provider]: https://www.data-provider.org
[axios]: https://github.com/axios/axios
[get-started]: https://www.data-provider.org/docs/getting-started
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro

[coveralls-image]: https://coveralls.io/repos/github/data-provider/axios/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/axios
[build-image]: https://github.com/data-provider/axios/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/data-provider/axios/actions?query=workflow%3Abuild+branch%3Amaster
[last-commit-image]: https://img.shields.io/github/last-commit/data-provider/axios.svg
[last-commit-url]: https://github.com/data-provider/axios/commits
[license-image]: https://img.shields.io/npm/l/@data-provider/axios.svg
[license-url]: https://github.com/data-provider/axios/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@data-provider/axios.svg
[npm-downloads-url]: https://www.npmjs.com/package/@data-provider/axios
[npm-dependencies-image]: https://img.shields.io/david/data-provider/axios.svg
[npm-dependencies-url]: https://david-dm.org/data-provider/axios
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=data-provider_axios&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=data-provider_axios
[release-image]: https://img.shields.io/github/release-date/data-provider/axios.svg
[release-url]: https://github.com/data-provider/axios/releases

