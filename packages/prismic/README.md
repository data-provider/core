# Important Notice

> **⚠ Project Discontinuation**  
> We regret to inform you that this project is no longer maintained. For an alternative solution, consider using [React Query](https://tanstack.com/query)

<p align="center"><a href="https://data-provider.javierbrea.com" target="_blank" rel="noopener noreferrer"><img width="120" src="https://data-provider.javierbrea.com/img/logo_120.png" alt="Data Provider logo"></a></p>

<p align="center">
  <a href="https://github.com/data-provider/core/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/data-provider/core/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/data-provider/core"><img src="https://codecov.io/gh/data-provider/core/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=data-provider_core_prismic"><img src="https://sonarcloud.io/api/project_badges/measure?project=data-provider_core_prismic&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@data-provider/prismic"><img src="https://img.shields.io/npm/dm/@data-provider/prismic.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/data-provider/core/blob/master/packages/prismic/LICENSE"><img src="https://img.shields.io/npm/l/@data-provider/prismic.svg" alt="License"></a>
</p>

---

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

Read about how to configure all @data-provider/prismic instances at a time using the [Data Provider `providers` handler](https://data-provider.javierbrea.com/docs/api-providers).

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
Please read the [contributing guidelines](https://github.com/data-provider/core/blob/master/.github/CONTRIBUTING.md) and [code of conduct](https://github.com/data-provider/core/blob/master/.github/CODE_OF_CONDUCT.md).

[data-provider]: https://data-provider.javierbrea.com
[get-started]: https://data-provider.javierbrea.com/docs/getting-started
[basic-tutorial]: https://data-provider.javierbrea.com/docs/basics-intro
[prismic-javascript-url]: https://www.npmjs.com/package/prismic-javascript
[data-provider-react]: https://github.com/data-provider/core/blob/master/packages/react/README.md


