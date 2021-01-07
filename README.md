[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![Mutation testing badge][stryker-image]][stryker-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# [![Data Provider][logo]][home]

> Async Data Provider. Powered by Redux. Agnostic about data origins. Agnostic about UI Frameworks.

Data Provider is a data provider _(surprise!)_ with states and built-in cache for JavaScript apps.

The main target of the library are front-end applications, but it could be used also in [Node.js][nodejs].

It helps you __providing async data__ to your components informing them about __loading and error states__.
It also provides a __cache layer__, so you don´t have to worry about when to read the data, and allows you to __combine the results of different data providers__ using a syntax very similar to the known [Reselect][reselect], recalculating them only when one of the dependencies cache is cleaned.

As its states are managed with [Redux][redux], you can take advantage of his large ecosystem of addons, which will improve the developer experience. _(You don't need to use Redux directly in your application if you don't want, the library includes its own internal store for that purpose, which [can be migrated to your own store easily][api-store-manager] for debugging purposes, for example)._

You can use Data Provider with [React][react], or with any other view library. [Separated addons][addons] are available for that purpose, as [@data-provider/react][data-provider-react].

Data Provider is __agnostic about data origins__, so it can be used to read data from a REST API, from `localStorage`, or from any other origin. Choose one of the [available addons][addons] depending of the type of the origin you want to read from, as [`@data-provider/axios`][data-provider-axios], or [`@data-provider/browser-storage`][data-provider-browser-storage].

It has a __light weight__, 4.2KB gzipped in UMD format _(you have to add the Redux weight to this)_, and addons usually are even lighter.

## Docs

We have a website available to help you to learn to use Data Provider. There are tutorials, examples and many other resources to guide you to understand from the basic concepts to the more advanced patterns:

* [Home][home]
* [Get started][get-started]
* [Motivation][motivation]
* [Installation][installation]
* [Basic tutorial][basic-tutorial]
* [Addons][addons]
* [Recipes][recipes]
* [API reference][api-reference]

## Main features

### Agnostic about data origins

The Provider class provides the cache, state handler, etc., but not the `read` method. The `read` behavior is implemented by __different [Data Provider Origins addons][addons]__.

There are different origins addons available, such as __[Axios][data-provider-axios], [LocalStorage][data-provider-browser-storage], [Memory][data-provider-memory], etc.__ and building your own is so easy as extending the Provider class with a custom "readMethod".

Sharing the same interface for all origins, and being able to build Selectors combining all of them implies that your logic will be __completely isolated about WHERE the data is being retrieved.__

```javascript
import { Axios } from "@data-provider/axios";
import { LocalStorage } from "@data-provider/browser-storage";

export const books = new Axios({
  id: "books",
  url: "/api/books"
});

export const favoriteBooks = new LocalStorage({
  id: "favorite-books",
  initialState: {
    data: []
  }
});
```

### Selectors inspired by Reselect

Selectors cache is cleaned __whenever any dependency cache is cleaned.__

Exposing the __same interface than providers__ make consumers agnostic about what type of Provider or Selector are they consuming.

As in [Reselect][reselect], __Selectors are composable__. They can be used as input to other selectors.

__Powerful [dependencies api][api-selector]__: Catch dependencies errors, retrieve them in parallel, declare them as functions returning other providers or selectors, etc.

```javascript
import { Selector } from "@data-provider/core";

import { booksProvider } from "data/books";
import { authorsProvider } from "data/authors";

export const booksWithAuthor = new Selector(
  booksProvider,
  authorsProvider,
  (queryValue, books, authors) => {
    return books.map(book => ({
      ...book,
      author: authors.find(
        author => author.id === book.authorId
      )
    }))
  }
);
```

### Cache and memoization

The built-in cache ensures that Providers are __computed only once__.

Don't care about when a data has to be retrieved. Simply retrieve it always, Data Provider will do the optimization. __Avoid orchestrators and build fully modular pieces.__

Cache can be cleaned on-demand, and some specific origins providers implementations __even do it automatically__ when needed.

```jsx
import Books from "views/books";

const RenderBooksTwice = () => {
  return (
    <div>
      <Books />
      <Books />
    </div>
  );
};

export default RenderBooksTwice;
```

### Queryable

Providers and selectors instances can be queried, which returns a new child instance with its own `query value`.

Each different child has a different cache, different state, etc.

Different origins can use the `queryValue` for different purposes (API origins will normally use it for adding different params or query strings to the provider url, for example)

When the parent provider cache is clean, also the children is. _(For example, cleaning the cache of an API origin requesting to "/api/books", will also clean the cache for "/api/books?author=2")_

```javascript
import { useData, useLoading } from "@data-provider/react";

import { bookProvider } from "data/books";
import BookCard from "components/book-card";

const Book = ({ id }) => {
  const provider = bookProvider.query({ id });
  const book = useData(provider);
  const loading = useLoading(provider);

  if (loading) {
    return <Loading />;
  }
  return <BookCard title={book.title} author={book.author} />;
};

export default Book;
```

### UI binding addons

Data Provider is not concerned about the views, but UI binding addons are available.

For example, the [@data-provider/react][data-provider-react] package __gives you hooks to easily retrieve and provide data__ and other data-provider states to React components.

It also provides __HOCs__ like "withData", "withLoading", etc. creating a wrapper component handling all the logic for you.

__Optimized__, it takes care of reading the data and re-renders the component only when the provider desired properties have changed. It also takes care of reading the data again every time the cache of the provider is invalidated.

```jsx
import { useData, useLoading, useError } from "@data-provider/react";

import { booksProvider } from "data/books";
import ErrorComponent from "components/error";

const Books = () => {
  const error = useError(booksProvider);
  const data = useData(booksProvider);
  const loading = useLoading(booksProvider);

  if (error) {
    return <ErrorComponent error={error}/>
  }
  return <BooksList data={data} loading={loading} />;
};

export default Books;
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[nodejs]: https://nodejs.org/en/
[redux]: https://redux.js.org/
[redux-installation]: https://redux.js.org/introduction/installation
[react]: https://reactjs.org/
[data-provider-react]: https://www.npmjs.com/package/@data-provider/react
[data-provider-axios]: https://www.npmjs.com/package/@data-provider/axios
[data-provider-browser-storage]: https://www.npmjs.com/package/@data-provider/browser-storage
[data-provider-memory]: https://www.npmjs.com/package/@data-provider/memory
[reselect]: https://github.com/reduxjs/reselect

[logo]: https://www.data-provider.org/img/npm-logo.png
[home]: https://www.data-provider.org
[get-started]: https://www.data-provider.org/docs/getting-started
[motivation]: https://www.data-provider.org/docs/motivation
[installation]: https://www.data-provider.org/docs/installation
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro
[addons]: https://www.data-provider.org/docs/addons-intro
[recipes]: https://www.data-provider.org/docs/recipes-index
[api-reference]: https://www.data-provider.org/docs/api-reference
[api-selector]: https://www.data-provider.org/docs/api-selector
[api-store-manager]: https://www.data-provider.org/docs/api-store-manager

[coveralls-image]: https://coveralls.io/repos/github/data-provider/core/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/core
[build-image]: https://github.com/data-provider/core/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/data-provider/core/actions?query=workflow%3Abuild+branch%3Amaster
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
[stryker-image]: https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fdata-provider%2Fcore%2Fmaster
[stryker-url]: https://dashboard.stryker-mutator.io/reports/github.com/data-provider/core/master
