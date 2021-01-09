[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

## Overview

This package provides a [Data Provider][data-provider] origin for reading data from Prismic CMS API. As underlay, it uses the [prismic-javascript][prismic-javascript-url] client to provide the Prismic data.

## Api

`import { Prismic } from "@data-provider/prismic"`

`new Prismic(options)`
* Arguments
	* options - _`<Object>`_ Apart from common Data Provider options, this addon has next custom options:
    * url - _`<String>`_. Prismic api url.
		* fullResponse - _`<Boolean>`_ If `true`, the full response of the Prismic api will be used as value. If `false`, only the `response.results` property will be returned, which is the default behavior.
		* release - _`<String>`_ Prismic release to be read. This parameter will be passed as `ref` to the [prismic-javascript][prismic-javascript-url] query.

## Methods

### query

`prismic.query(queryValue)`
* Arguments
	* queryValue - `<Object>` containing properties:
		* documentType - `<String>` Prismic document type to filter by. (It will be used to build a [prismic-javascript][prismic-javascript-url] query as in `PrismicJs.Predicates.at("document.type", documentType)`)
* Returns - New queried instance having all common [Data Provider][data-provider] methods.

### config

Configure instance for all next `read` executions.

`prismic.config(options)`
* Arguments
	* options - `<Object>` containing properties:
		* url - _`<String>`_ Prismic api url.
		* fullResponse - _`<Boolean>`_ If `true`, the full response of the Prismic api will be used as value. If `false`, only the `response.results` property will be returned, which is the default behavior.
		* release - _`<String>`_ Prismic release to be read. This parameter will be passed as `ref` to the [prismic-javascript][prismic-javascript-url] query.

Read about how to configure all @data-provider/prismic instances at a time using the [Data Provider `providers` handler](https://www.data-provider.org/docs/api-providers).

Example of how to change all `@data-provider/prismic` requests urls at a time:

```js
import { providers } from "@data-provider/core";

providers.getByTag("prismic").config({
  url: "https://foo-prismic-repository.cdn.prismic.io/api/v2"
});

// All @data-provider/prismic instances will now be configured to request to provided url.
```

## Example

Next example will be easier to understand if you are already familiarized with the [Data Provider][data-provider] syntax.

```js
import { Prismic } from "@data-provider/prismic";

const prismic = new Prismic({
  url: "https://foo-prismic-repository.cdn.prismic.io/api/v2",
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

Please refer to the [@data-provider/react][data-provider-react] UI addon documentation to see how simple is the data-binding between React Components and @data-provider/prismic.

Connect a provider to all components that need it. Data Provider will fetch data only when needed, and will avoid making it more than once, no matter how many components need the data.

## Tags

Providers created with this addon will have automatically the `prismic` tag, so you can select all of them together using the `providers` methods as in:

```javascript
import { providers } from "@data-provider/core";

providers.getByTag("prismic").cleanCache();
```


## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider]: https://www.data-provider.org
[get-started]: https://www.data-provider.org/docs/getting-started
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro
[prismic-javascript-url]: https://www.npmjs.com/package/prismic-javascript
[data-provider-react]: https://github.com/data-provider/react

[coveralls-image]: https://coveralls.io/repos/github/data-provider/prismic/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/prismic
[build-image]: https://github.com/data-provider/prismic/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/data-provider/prismic/actions?query=workflow%3Abuild+branch%3Amaster
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


