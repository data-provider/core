[![Build status][travisci-image]][travisci-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# React bindings for [@data-provider][data-provider]

> Set of hooks and HOCs for binding [@data-provider][data-provider] to React components

## Installation

```bash
npm i --save @data-provider/react
```

## Hooks

### `useDataProvider(provider, [equalityFn])`

Triggers the provider `read` method and gives you the `data`, `loading` and `error` properties from the state of the provider or selector. When the provider cache is cleaned, it automatically triggers `read` again.

Use this hook only when you need all mentioned properties, because your component will be re-rendered any time one of them changes. If you only need one or two properties, better use one of the hooks described bellow.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance.
* `equalityFn` _(Function)_: Function used to determine if returned value is different from the previous one, which will produce a re-render of the component. Read [React-redux hooks docs][react-redux-hooks] for further info.

#### Returns

* _(Array)_ - Array containing `data`, `loading` and `error` properties, in that order.

#### Example

```jsx
import { useDataProvider } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const [data, loading, error] = useDataProvider(books);
  // Do your stuff here
};
```

### `useData(provider, [equalityFn])`

Triggers `read` and gives you only the `data` property from the state of the provider or selector. When the provider cache is cleaned, it automatically triggers `read` again.

Arguments are the same than described for the [`useDataProvider` hook](#usedataproviderprovider-equalityfn).

#### Returns

* _(Any)_ - Value of the `data` property from the provider state.


#### Example

```jsx
import { useData } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const data = useData(books);
  // Do your stuff here
};
```

### `useLoading(provider)`

Triggers `read` and gives you only the `loading` property from the state of the provider or selector. When the provider cache is cleaned, it automatically triggers `read` again.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance.

#### Returns

* _(Boolean)_ - Value of the `loading` property from the provider state.

#### Example

```jsx
import { useLoading } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const loading = useLoading(books);
  // Do your stuff here
};
```

### `useError(provider)`

Triggers `read` and gives you only the `error` property from the state of the provider or selector. When the provider cache is cleaned, it automatically triggers `read` again.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance.

#### Returns

* _(null)_/_(Error)_ - `null` when the is no error, or `Error` causing the provider `read` method rejection.

#### Example

```jsx
import { useError } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const error = useError(books);
  // Do your stuff here
};
```

### `useRefresh(provider)`

Triggers `read` method of the `provider` first time the component is rendered, and each time its cache is cleaned. This hook is used internally by the other ones, but you could also use it separatelly.

## HOCs

### `withDataProvider(provider, [customPropertiesNames])(Component)`

This High Order Component triggers the read method of the provider and gives to the component the `data`, `loading` and `error` properties from its state. It will trigger the `read` method each time the provider cache is cleaned.

Use this HOC only when you need all mentioned properties, because your component will be re-rendered any time one of them changes. If you only need one or two properties, better use one of the HOCs described bellow.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a `function` returning a provider or selector instance, or `undefined`. The function receives the component props as argument (Use a function when you want to `query` the provider depending of the component props). The HOC also accepts the function returning `undefined`, in which case, no provider will be used (so, you can also decide to "not connect" the component dependending of its props)
* `customPropertiesNames` _(Array of Strings)_: By default, the HOC will pass to the component `data`, `loading` and `error` properties. You can change that props passing an array with new names in the same order _(`["fooData", "fooLoading", "fooError"]`)_. You can omit properties you don't want to redefine, for example: _`["fooData"]`_ will change only the `data` property.

#### Examples

Using a provider:

```jsx
import { withDataProvider } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ data, loading, error }) => {
  // Do your stuff here
};

export default withDataProvider(books)(BooksList);
```

With custom properties:

```jsx
const BooksList = ({ booksData, booksLoading, booksError }) => {
  // Do your stuff here
};

export default withDataProvider(books, ["booksData", "booksLoading", "booksError"])(BooksList);
```

Using a function:

```jsx
const BookDetail = ({ data, loading, error }) => {
  // Do your stuff here
};

export default withDataProvider(({ id }) => books.query({ urlParam: { id }}))(BookDetail);
```

### `withData(provider, customPropName)(Component)`

This High Order Component triggers the read method of the provider and gives to the component only the `data` property from its state. It will trigger the `read` method each time the provider cache is cleaned.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataProvider HOC docs](#withdataproviderprovider-custompropertiesnamescomponent)
* `customPropName` _(String)_: By default, the HOC will pass to the component a `data` property. You can change that prop passing a new property name as second argument.

#### Examples

```jsx
import { withData } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ data }) => {
  // Do your stuff here
};

export default withData(books)(BooksList);
```

Using custom property:

```jsx
const BooksList = ({ booksData }) => {
  // Do your stuff here
};

export default withData(books, "booksData")(BooksList);
```

### `withLoading(provider, customPropName)(Component)`

This High Order Component triggers the read method of the provider and gives to the component only the `loading` property from its state.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataProvider HOC docs](#withdataproviderprovider-custompropertiesnamescomponent)
* `customPropName` _(String)_: By default, the HOC will pass to the component a `loading` property. You can change that prop passing a new property name as second argument.

#### Examples

```jsx
import { withLoading } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ loading }) => {
  // Do your stuff here
};

export default withLoading(books)(BooksList);
```

Using custom property:

```jsx
const BooksList = ({ booksLoading }) => {
  // Do your stuff here
};

export default withLoading(books, "booksLoading")(BooksList);
```

### `withError(provider, customPropName)(Component)`

This High Order Component triggers the read method of the provider and gives to the component only the `error` property from its state. It will trigger the `read` method each time the provider cache is cleaned.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataProvider HOC docs](#withdataproviderprovider-custompropertiesnamescomponent)
* `customPropName` _(String)_: By default, the HOC will pass to the component an `error` property. You can change that prop passing a new property name as second argument.

#### Examples

```jsx
import { withError } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ error }) => {
  // Do your stuff here
};

export default withError(books)(BooksList);
```

Using custom property:

```jsx
const BooksList = ({ booksError }) => {
  // Do your stuff here
};

export default withError(books, "booksError")(BooksList);
```

### `withRefresh(provider)(Component)`

This High Order Component triggers the `read` method of the provider each time the provider cache is cleaned. It is used internally by the rest of HOCs, but you could also use it separately.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataProvider HOC docs](#withdataproviderprovider-custompropertiesnamescomponent)

### `withDataProviderBranch(provider, [customPropertiesNames])(Component, LoadingComponent, ErrorComponent)`

This HOC works as the already described [`withDataProvider`](#withdataproviderprovider-custompropertiesnamescomponent), but it will render one component or another depending of the result. If the provider is loading, it will render `LoadingComponent`, if it has an error, it will render `ErrorComponent` (passing the `error` property to it), or `Component` when there is no error and it is not loading (passing the `data` property to it).

```jsx
import { withDataProviderBranch } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ data }) => {
  // Do your stuff here
};

const BooksLoading = () => {
  // Do your stuff here
};

const BooksError = ({ error }) => {
  // Do your stuff here
};

export default withDataProviderBranch(books)(BooksList, BooksLoading, BooksError);
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider]: https://www.data-provider.org
[axios]: https://github.com/axios/axios
[get-started]: https://www.data-provider.org/docs/getting-started
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro

[react-redux-hooks]: https://react-redux.js.org/api/hooks

[coveralls-image]: https://coveralls.io/repos/github/data-provider/react/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/react
[travisci-image]: https://travis-ci.com/data-provider/react.svg?branch=master
[travisci-url]: https://travis-ci.com/data-provider/react
[last-commit-image]: https://img.shields.io/github/last-commit/data-provider/react.svg
[last-commit-url]: https://github.com/data-provider/react/commits
[license-image]: https://img.shields.io/npm/l/@data-provider/react.svg
[license-url]: https://github.com/data-provider/react/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@data-provider/react.svg
[npm-downloads-url]: https://www.npmjs.com/package/@data-provider/react
[npm-dependencies-image]: https://img.shields.io/david/data-provider/react.svg
[npm-dependencies-url]: https://david-dm.org/data-provider/react
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=data-provider-react&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=data-provider-react
[release-image]: https://img.shields.io/github/release-date/data-provider/react.svg
[release-url]: https://github.com/data-provider/react/releases
