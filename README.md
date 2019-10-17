[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# ![Mercury Logo](assets/logos/mercury_wings_orange_100.png) Mercury Api

## Overview

This package provides a Mercury Api origin.

* __Mercury queries__ based on query strings and url parameters.
* __Built-in cache__. Different caches are provided for different queryStrings and url parameters.
* __Reactivity__ to CRUD actions. When a "create", "update" or "delete" method is called over an instance, the instance cache is cleaned.

## Api

`import { Api } from "@xbyorange/mercury-api"`

`new Api(url, options)`
* Arguments
	* url - _`<String>`_. Api url. Parameters can be defined using ":parameterName". Please refer to the [path-to-regexp][path-to-regex-url] package for further info.
	* options - _`<Object>`_ Containing options:
		* tags - _`<String or Array of Strings>`_ - The api instance is added to correspondant groups using these tags. Afterwards, configuration, headers, etc. can be changed for certain groups using the [`sources` object methods described in the mercury docs][mercury-sources-docs-url], or the `api` object methods described below. The "api" tag will is added automatically to all Api instances.
		* baseUrl - _`<String>`_ - Added as prefix to all requests.
		* createMethod - _`<String>`_ - HTTP method to be used in axios requests for `create` method.
		* readMethod - _`<String>`_ - HTTP method to be used in axios requests for `read` method.
		* updateMethod - _`<String>`_ - HTTP method to be used in axios requests for `update` method.
		* deleteMethod - _`<String>`_ - HTTP method to be used in axios requests for `delete` method.
		* authErrorStatus -  _`<Number>`_ - Status code that will be considered as an authentication error. When detected, the `authErrorHandler` function will be executed instead of returning an error. See the authentication example below.
		* authErrorHandler - _`<Function>`_ - Handler that will be executed when an authentication error is received.
			* Arguments:
				* origin - _`origin instance`_ As first argument, the function will receive the origin itself. This will allow to set custom authentication headers after executing login, as example.
				* retry - _`<Function>` As second argument, a `retry` function is received, it has to be executed in order to retry the authentication failed request.
			* Returns: This function should return a `Promise` rejected with an error, or the execution of the received `retry` method.
		* onBeforeRequest - _`<Function>`_ - Handler that will be executed before any source method. Useful, for example, to set origin headers just before each request is executed.
			* Arguments:
				* origin - _`origin instance`_ As first argument, the function will receive the origin itself.
		* onceBeforeRequest - _`<Function>`_ - Handler that will be executed once time just before the first request. Useful to set origin configuration, for example.
			* Arguments:
				* origin - _`origin instance`_ As first argument, the function will receive the origin itself.
		* expirationTime - _`<Number>`_ - The cache will be automatically cleaned each `expirationTime` miliseconds.
		* retries - _`<Number>`_ - Number of retries that will be executed when a request fails before definitively failing. Requests will be retried for network errors or a 5xx error on an idempotent request (GET, PUT, DELETE).
		* cache - _`<Boolean>`_ - Defines whether the resource will use cache or not. If `false`, all "read" executions will be sent to the server.
		* fullResponse - _`<Boolean>`_ - If `true`, the full response object will be used as value, so you can consult headers, etc. If `false`, only the `response.data` will be returned, which is the default behavior.
		* validateStatus - _`<Function>`_ - Function that will be used to determine if response status has to be considered as `failed` or `success`.
			* Arguments:
				* status - _`<Number>`_ - Status code of the request.
			* Returns: Should return `true` for `success` requests, and `false` for failed ones.
		* validateResponse - _`<Function>`_ - Function that will be used to determine if response has to be considered as `failed` or `success`.
			* Arguments:
				* response - _`<Object>`_ - Response of the request.
			* Returns: Should return a Promise resolves for `success` requests, and a Promise rejected with an error for failed ones.
		* errorHandler - _`<Function>`_ - Function used to parse errors. The returned value will be setted as `error` in the origin `error` property.
			* Arguments:
				* error - _`<Error>`_ - Error object produced by a failed request.
			* Returns: Should return a rejected Promise, containing the new Error.
		* defaultValue - _`<Any>`_ - Default value of origin until real data is requested.

## Methods

### query

`api.query(queryObject)`
* Arguments
	* queryObject - `<Object>` containing properties:
		* queryString - `<Object>` Keys of the object will be passed as query strings in the url of the request.
		* urlParams - `<Object>` Keys of the object will be replaced by correspondant url parameters defined in the url as ":param". Please refer to the [path-to-regexp][path-to-regex-url] package for further info.
* Returns - New queried api instance having all methods described in this chapter.

### clean cache

`api.clean()`

* The `cache` of a queried api resource will be automatically cleaned when the `update` or `delete` methods are executed for that query.
* If `update` or `delete` methods are executed over the origin without query, cache of all queried resources will be cleaned too.
* All `cache` will be cleaned if the `create` method is executed.

### setHeaders

Define headers that will be applied to all subsequent requests.

`api.setHeaders(headers)`
* Arguments
	* headers - _`<Object>`_ Each property in the object will be applied as a header.

```js
booksCollection.setHeaders({
  Authorization: `Bearer ${token}`
});
```

### addHeaders

Add a new header. Current headers will be extended with received headers object, and applied to all subsequent requests:

`api.addHeaders(headers)`
* Arguments
	* headers - _`<Object>`_ Each property in the object will be applied as a header.

```js
booksCollection.addHeaders({
  "Cache-Control": "no-cache"
});
```

### config

Config method can be invoked at any time to change the configuration. The resultant configuration will be the extension of the current options with the provided ones.

`api.config(options)`
* Arguments
	* options - _`<Object>`_ Options object as described above.

## Handling many api instances at a time.

`apis` object methods allow to set headers of many instances at a time. Apis can be grouped and categorized using tags (through the `tags` option), and this methods will be applied only to apis matching provided tags.

If no tags are provided when invoking methods, they will be applied to all api instances.

> An [example of multiple configuration](docs/apis-config.md) is available in the docs.

`import { apis } from "@xbyorange/mercury-api"`

### clean cache

Use the ["mercury" `sources` object][mercury-sources-docs-url] for cleaning many instances at a time. Use the "api" tag to clean all "mercury-api" instances:

```js
import { sources } from "@xbyorange/mercury";

sources.getByTag("api").clean();
```

### setHeaders

It defines headers that will be applied to all subsequent requests of api instances matching provided tags.

`apis.setHeaders(headers [,tags])`
* Arguments
	* headers - _`<Object>`_ Headers object to be applied as in `api.setHeaders` method described above.
	* tags - _`<String or Array of Strings>`_ Tag/s of those apis in which the `setHeaders` method should be executed. If no defined, `setHeaders` method of all api instances will be called.

```js
apis.setHeaders({ Authorization: `Bearer ${token}` }, ["need-auth"]);
```

### addHeaders

It adds a new header to all api instances matching provided tags. Current headers will be extended with received headers object, and applied to all subsequent requests:

`apis.addHeaders(headers [,tags])`
* Arguments
	* headers - _`<Object>`_ Each property in the object will be applied as a header.
	* tags - _`<String or Array of Strings>`_ Tag/s of those apis in which the `addHeaders` method should be executed. If no defined, `addHeaders` method of all api instances will be called.

```js
apis.addHeaders({ Authorization: `Bearer ${token}` }, ["need-auth"]);
```

### config

Use the ["mercury" `sources` object][mercury-sources-docs-url] for configuring many instances at a time. Use the "api" tag to configure all "mercury-api" instances:

```js
import { sources } from "@xbyorange/mercury";

sources.getByTag("api").config({
  retries: 0
});
```

## Examples

Next example will be easier to understand if you are already familiarized with the [mercury][mercury-url] syntax.

```js
import { Selector } from "@xbyorange/mercury";
import { Api } from "@xbyorange/mercury-api";

const booksCollection = new Api("http://api.library.com/books");
const authorsCollection = new Api("http://api.library.com/authors");

const booksWithAuthors = new Selector(
  {
    source: booksCollection,
    query: author => {
      queryString: {
        author
      }
    }
  },
  authorsCollection,
  (booksResults, authorsResults) =>
      booksResults.map(book => ({
      ...book,
      authorName: authorsResults.find(author => author.id === book.author)
    }))
);

// Each book now includes an "authorName" property.
const results = await booksWithAuthors.read();

// Request is not dispatched again, now results are cached.
await booksWithAuthors.read();

console.log(booksWithAuthors.read.value); //Value still remain the same

booksCollection.create({
  author: "George Orwell",
  book: "1984"
});

// Request to books is dispatched again, as cache was cleaned. Authors are still cached.
await booksWithAuthors.read();

// Request is dispatched, but passing "author" query string
const booksOfOrwell = await booksWithAuthors.query("George Orwell").read();

// Request is already cached. It will not be repeated.
await booksWithAuthors.query("George Orwell");

```

### More examples

The [mercury][mercury-url] library uses this origin in his examples, so you can refer to the [library documentation][mercury-url] to found more examples.

Specific api origin examples:

* [configuration](docs/config.md)
* [configuring multiple instance at a time](docs/apis-config.md)
* [authentication](docs/authentication.md)

## Usage with frameworks

### React

Please refer to the [react-mercury][react-mercury-url] documentation to see how simple is the data-binding between React Components and mercury-api.

Connect a source to all components that need it. Mercury will fetch data only when needed, and will avoid making it more than once, no matter how many components need the data.

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[mercury-url]: https://github.com/xbyorange/mercury
[react-mercury-url]: https://github.com/xbyorange/react-mercury
[mercury-sources-docs-url]: https://github.com/XbyOrange/mercury/blob/master/docs/sources/api.md
[path-to-regex-url]: https://www.npmjs.com/package/path-to-regexp

[coveralls-image]: https://coveralls.io/repos/github/XbyOrange/mercury-api/badge.svg
[coveralls-url]: https://coveralls.io/github/XbyOrange/mercury-api
[travisci-image]: https://travis-ci.com/xbyorange/mercury-api.svg?branch=master
[travisci-url]: https://travis-ci.com/xbyorange/mercury-api
[last-commit-image]: https://img.shields.io/github/last-commit/xbyorange/mercury-api.svg
[last-commit-url]: https://github.com/xbyorange/mercury-api/commits
[license-image]: https://img.shields.io/npm/l/@xbyorange/mercury-api.svg
[license-url]: https://github.com/xbyorange/mercury-api/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@xbyorange/mercury-api.svg
[npm-downloads-url]: https://www.npmjs.com/package/@xbyorange/mercury-api
[npm-dependencies-image]: https://img.shields.io/david/xbyorange/mercury-api.svg
[npm-dependencies-url]: https://david-dm.org/xbyorange/mercury-api
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=xbyorange-mercury-api&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=xbyorange-mercury-api
[release-image]: https://img.shields.io/github/release-date/xbyorange/mercury-api.svg
[release-url]: https://github.com/xbyorange/mercury-api/releases

