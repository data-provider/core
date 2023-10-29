# Important Notice

> **⚠ Project Discontinuation**  
> We regret to inform you that this project is no longer maintained. For an alternative solution, consider using [React Query](https://tanstack.com/query)

<p align="center"><a href="https://data-provider.javierbrea.com" target="_blank" rel="noopener noreferrer"><img width="120" src="https://data-provider.javierbrea.com/img/logo_120.png" alt="Data Provider logo"></a></p>

<p align="center">
  <a href="https://github.com/data-provider/core/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/data-provider/core/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/data-provider/core"><img src="https://codecov.io/gh/data-provider/core/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@data-provider/core"><img src="https://img.shields.io/npm/dm/@data-provider/core.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/data-provider/core/releases"><img src="https://img.shields.io/github/release-date/data-provider/core.svg" alt="Last release"></a>
  <a href="https://github.com/data-provider/core/commits"><img src="https://img.shields.io/github/last-commit/data-provider/core.svg" alt="Last commit"></a>
  <a href="https://github.com/data-provider/core/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@data-provider/core.svg" alt="License"></a>
</p>

---

## Introduction

Data Provider is a data provider _(surprise!)_ with states and built-in cache for JavaScript apps.

The main target of the library are front-end applications, but it could be used also in [Node.js][nodejs].

It helps you __providing async data__ to your components informing them about __loading and error states__.
It also provides a __cache layer__, so you don´t have to worry about when to read the data, and allows you to __combine the results of different data providers__ using a syntax very similar to the known [Reselect][reselect], recalculating them only when one of the dependencies cache is cleaned.

As its states are managed with [Redux][redux], you can take advantage of his large ecosystem of addons, which will improve the developer experience. _(You don't need to use Redux directly in your application if you don't want, the library includes its own internal store for that purpose, which [can be migrated to your own store easily][api-store-manager] for debugging purposes, for example)._

You can use Data Provider with [React][react], or with any other view library. [Separated addons][addons] are available for that purpose, as [@data-provider/react][data-provider-react].

Data Provider is __agnostic about data origins__, so it can be used to read data from a REST API, from `localStorage`, or from any other origin. Choose one of the [available addons][addons] depending of the type of the origin you want to read from, as [`@data-provider/axios`][data-provider-axios], or [`@data-provider/browser-storage`][data-provider-browser-storage].

It has a __light weight__, 4.2KB gzipped in UMD format _(you have to add the Redux weight to this)_, and addons usually are even lighter.

## Documentation

To check out docs, visit [data-provider.org][website-url].

## Ecosystem

| Project | Status | Description |
| --- | --- | --- |
| [core] | [![core-status]][core-package] | Agnostic base Provider and Selector |
| [axios] | [![axios-status]][axios-package] | API REST data origin using [Axios][axios-library] |
| [browser-storage] | [![browser-storage-status]][browser-storage-package] | Data origin for `localStorage` and `sessionStorage` |
| [memory] | [![memory-status]][memory-package] | Data origin for objects in memory |
| [prismic] | [![prismic-status]][prismic-package] | Data origin for [Prismic CMS][prismic-website] API |
| [react] | [![react-status]][react-package] | React bindings. Provides hooks and HOCs |

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[core]: https://github.com/data-provider/core/tree/master/packages/core
[core-status]: https://img.shields.io/npm/v/@data-provider/core.svg
[core-package]: https://npmjs.com/package/@data-provider/core

[axios]: https://github.com/data-provider/core/tree/master/packages/axios
[axios-status]: https://img.shields.io/npm/v/@data-provider/axios.svg
[axios-package]: https://npmjs.com/package/@data-provider/axios

[browser-storage]: https://github.com/data-provider/core/tree/master/packages/browser-storage
[browser-storage-status]: https://img.shields.io/npm/v/@data-provider/browser-storage.svg
[browser-storage-package]: https://npmjs.com/package/@data-provider/browser-storage

[memory]: https://github.com/data-provider/core/tree/master/packages/memory
[memory-status]: https://img.shields.io/npm/v/@data-provider/memory.svg
[memory-package]: https://npmjs.com/package/@data-provider/memory

[prismic]: https://github.com/data-provider/core/tree/master/packages/prismic
[prismic-status]: https://img.shields.io/npm/v/@data-provider/prismic.svg
[prismic-package]: https://npmjs.com/package/@data-provider/prismic

[react]: https://github.com/data-provider/core/tree/master/packages/react
[react-status]: https://img.shields.io/npm/v/@data-provider/react.svg
[react-package]: https://npmjs.com/package/@data-provider/react

[website-url]: https://data-provider.javierbrea.com

[axios-library]: https://github.com/axios/axios
[nodejs]: https://nodejs.org/en/
[reselect]: https://github.com/reduxjs/reselect
[redux]: https://redux.js.org/
[api-store-manager]: https://data-provider.javierbrea.com/docs/api-store-manager
[react]: https://reactjs.org/
[addons]: https://data-provider.javierbrea.com/docs/addons-intro
[data-provider-react]: ./packages/react/README.md
[data-provider-axios]: ./packages/axios/README.md
[data-provider-browser-storage]: ./packages/browser-storage/README.md
[data-provider-memory]: ./packages/memory/README.md
[prismic-website]: https://prismic.io/

