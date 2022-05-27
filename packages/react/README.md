<p align="center"><a href="https://www.data-provider.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.data-provider.org/img/logo_120.png" alt="Data Provider logo"></a></p>

<p align="center">
  <a href="https://github.com/data-provider/core/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/data-provider/core/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/data-provider/core"><img src="https://codecov.io/gh/data-provider/core/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=data-provider_core_react"><img src="https://sonarcloud.io/api/project_badges/measure?project=data-provider_core_react&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@data-provider/react"><img src="https://img.shields.io/npm/dm/@data-provider/react.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/data-provider/core/blob/master/packages/react/LICENSE"><img src="https://img.shields.io/npm/l/@data-provider/react.svg" alt="License"></a>
</p>

---

# React bindings for [@data-provider][data-provider]

> Set of hooks and HOCs for binding [@data-provider][data-provider] to React components

## Installation

```bash
npm i --save @data-provider/react
```

## Available hooks

* [useDataLoadingError](#usedataloadingerrorprovider-equalityfn)
* [useDataLoadedError](#usedataloadederrorprovider-equalityfn)
* [useData](#usedataprovider-equalityfn)
* [useLoading](#useloadingprovider)
* [useLoaded](#useloadedprovider)
* [useError](#useerrorprovider)
* [usePolling](#usepollingprovider-interval)

## Available HOCs

* [withDataLoadingError](#withdataloadingerrorprovider-custompropertiesnamescomponent)
* [withDataLoadedError](#withdataloadederrorprovider-custompropertiesnamescomponent)
* [withData](#withdataprovider-custompropnamecomponent)
* [withLoading](#withloadingprovider-custompropnamecomponent)
* [withLoaded](#withloadedprovider-custompropnamecomponent)
* [withError](#witherrorprovider-custompropnamecomponent)
* [withPolling](#withpollingprovider-intervalcomponent)
* [withDataLoadingErrorComponents](#withdataloadingerrorcomponentsprovider-custompropertiesnamescomponent-loadingcomponent-errorcomponent)
* [withDataLoadedErrorComponents](#withdataloadederrorcomponentsprovider-custompropertiesnamescomponent-notloadedcomponent-errorcomponent)

## Hooks

### `useDataLoadingError(provider, [equalityFn])`

Triggers the provider `read` method and gives you the `data`, `loading` and `error` properties from the state of the provider or selector. When the provider cache is cleaned, it automatically triggers `read` again.

Use this hook only when you need all mentioned properties, because your component will be re-rendered any time one of them changes. If you only need one or two properties, better use one of the hooks described bellow.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance.
* `equalityFn` _(Function)_: Function used to determine if returned value is different from the previous one, which will produce a re-render of the component. Read [React-redux hooks docs][react-redux-hooks] for further info.

#### Returns

* _(Array)_ - Array containing `data`, `loading` and `error` properties, in that order.

#### Example

```jsx
import { useDataLoadingError } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const [data, loading, error] = useDataLoadingError(books);
  // Do your stuff here
};
```

### `useDataLoadedError(provider, [equalityFn])`

This hook has the same behavior and interface than the described for the [`useDataLoadingError`](#usedataloadingerrorprovider-equalityfn) one, but it returns the `data`, `loaded` and `error` properties from the state of the provider or selector.

Use this hook only when you don't want to rerender a Component each time the provider is loading. It will return `loaded` as `true` once the provider has loaded for the first time, and it will not change again. This is useful to avoid rerenders in scenarios having "pollings", for example, as it will avoid to render a "loading" each time the data is refreshed.

Take into account that the `loaded` property will not be set as `true` until a success read has finished, so the error may have a value, even when `loaded` is `false`. 

#### Returns

* _(Array)_ - Array containing `data`, `loaded` and `error` properties, in that order.

#### Example

```jsx
import { useDataLoadedError } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const [data, loaded, error] = useDataLoadedError(books);
  // Do your stuff here
};
```

### `useData(provider, [equalityFn])`

Triggers `read` and gives you only the `data` property from the state of the provider or selector. When the provider cache is cleaned, it automatically triggers `read` again.

Arguments are the same than described for the [`useDataLoadingError` hook](#usedataloadingerrorprovider-equalityfn).

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

### `useLoaded(provider)`

Triggers `read` and gives you only the `loaded` property from the state of the provider or selector. When the provider cache is cleaned, it automatically triggers `read` again.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance.

#### Returns

* _(Boolean)_ - Value of the `loaded` property from the provider state.

#### Example

```jsx
import { useLoaded } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const loaded = useLoaded(books);
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

### `usePolling(provider, [interval/options], [options])`

Triggers `cleanDependenciesCache` method of the provider each `interval` miliseconds while the component is "alive". It can be used in multiple components at the same time for the same provider. In that case, the used interval will be the lower one, and it will be recalculated each time a component is added or removed.

This hook can also be used with [Data Provider selectors][data-provider-selectors], as it will clean the cache of all selector dependencies. So, if you are using a selector combining data from two axios providers, for example, it will result in repeating both provider http requests and recalculating the selector result every defined interval.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance.
* `interval` _(Number)_: Interval in miliseconds to clean the provider dependencies cache. Default is 5000.
* `options` _(Object)_: Options object that will be passed as is to the `cleanCache` method of providers or `cleanDependenciesCache` method of selectors. Check the [data-provider API documentation](https://www.data-provider.org/docs/api-providers-and-selectors-methods) for further info. Options can be defined as second argument if interval is omitted.

#### Examples

```jsx
import { useData, usePolling } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = () => {
  const data = useData(books);
  usePolling(books, 3000);
  // Do your stuff here. Books will fetched again from server every 3 seconds
};
```

```jsx
import { useData, usePolling } from "@data-provider/react";

import { booksAndAuthors, books } from "../data/books";

const BooksList = () => {
  const data = useData(books);
  usePolling(booksAndAuthors, {
    except: [books]
  });
  // Do your stuff here. booksAndAuthors selector dependencies will fetched again from server every 3 seconds, except the "books" provider.
};
```

## HOCs

### `withDataLoadingError(provider, [customPropertiesNames])(Component)`

This High Order Component triggers the read method of the provider and gives to the component the `data`, `loading` and `error` properties from its state. It will trigger the `read` method each time the provider cache is cleaned.

Use this HOC only when you need all mentioned properties, because your component will be re-rendered any time one of them changes. If you only need one or two properties, better use one of the HOCs described bellow.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a `function` returning a provider or selector instance, or `undefined`. The function receives the component props as argument (Use a function when you want to `query` the provider depending of the component props). The HOC also accepts the function returning `undefined`, in which case, no provider will be used (so, you can also decide to "not connect" the component dependending of its props)
* `customPropertiesNames` _(Array of Strings)_: By default, the HOC will pass to the component `data`, `loading` and `error` properties. You can change that props passing an array with new names in the same order _(`["fooData", "fooLoading", "fooError"]`)_. You can omit properties you don't want to redefine, for example: _`["fooData"]`_ will change only the `data` property.

#### Examples

Using a provider:

```jsx
import { withDataLoadingError } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ data, loading, error }) => {
  // Do your stuff here
};

export default withDataLoadingError(books)(BooksList);
```

With custom properties:

```jsx
const BooksList = ({ booksData, booksLoading, booksError }) => {
  // Do your stuff here
};

export default withDataLoadingError(books, ["booksData", "booksLoading", "booksError"])(BooksList);
```

Using a function:

```jsx
const BookDetail = ({ data, loading, error }) => {
  // Do your stuff here
};

export default withDataLoadingError(({ id }) => books.query({ urlParam: { id }}))(BookDetail);
```

### `withDataLoadedError(provider, [customPropertiesNames])(Component)`

This hoc has the same behavior and interface than the described for the [`withDataLoadingError`](#withdataloadingerrorprovider-custompropertiesnamescomponent) one, but it provides the `data`, `loaded` and `error` properties from the state.

Use this hook only when you don't want to rerender a Component each time the provider is loading. It will return `loaded` as `true` once the provider has loaded for the first time, and it will not change again. This is useful to avoid rerenders in scenarios having "pollings", for example, as it will avoid to render a "loading" each time the data is refreshed.

Take into account that the `loaded` property will not be set as `true` until a success read has finished, so the error may have a value, even when `loaded` is `false`.

#### Examples

Using a provider:

```jsx
import { withDataLoadedError } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ data, loaded, error }) => {
  // Do your stuff here
};

export default withDataLoadedError(books)(BooksList);
```

With custom properties:

```jsx
const BooksList = ({ booksData, booksAreLoaded, booksError }) => {
  // Do your stuff here
};

export default withDataLoadedError(books, ["booksData", "booksAreLoaded", "booksError"])(BooksList);
```

### `withData(provider, customPropName)(Component)`

This High Order Component triggers the read method of the provider and gives to the component only the `data` property from its state. It will trigger the `read` method each time the provider cache is cleaned.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataLoadingError HOC docs](#withdataloadingerrorprovider-custompropertiesnamescomponent)
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

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataLoadingError HOC docs](#withdataloadingerrorprovider-custompropertiesnamescomponent)
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

### `withLoaded(provider, customPropName)(Component)`

This High Order Component triggers the read method of the provider and gives to the component only the `loaded` property from its state.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataLoadingError HOC docs](#withdataloadingerrorprovider-custompropertiesnamescomponent)
* `customPropName` _(String)_: By default, the HOC will pass to the component a `loaded` property. You can change that prop passing a new property name as second argument.

#### Examples

```jsx
import { withLoaded } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ loaded }) => {
  // Do your stuff here
};

export default withLoaded(books)(BooksList);
```

Using custom property:

```jsx
const BooksList = ({ booksLoaded }) => {
  // Do your stuff here
};

export default withLoaded(books, "booksLoaded")(BooksList);
```

### `withError(provider, customPropName)(Component)`

This High Order Component triggers the read method of the provider and gives to the component only the `error` property from its state. It will trigger the `read` method each time the provider cache is cleaned.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataLoadingError HOC docs](#withdataloadingerrorprovider-custompropertiesnamescomponent)
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

### `withPolling(provider, [interval/options], [options])(Component)`

This High Order Component works as the hook `usePolling` described above.

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataLoadingError HOC docs](#withdataloadingerrorprovider-custompropertiesnamescomponent)
* `interval` _(Number)_: Interval in miliseconds to clean the provider dependencies cache. Default is 5000.
* `options` _(Object)_: Options object that will be passed as is to the `cleanCache` method of providers or `cleanDependenciesCache` method of selectors. Check the [data-provider API documentation](https://www.data-provider.org/docs/api-providers-and-selectors-methods) for further info. Options can be defined as second argument if interval is omitted.

#### Example

```jsx
import { withData, withPolling } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ data }) => {
  // Do your stuff here. Books data will fetched again from server every 3 seconds
};

export default withPolling(books, 3000)(withData(books)(BooksList));
```

#### Arguments

* `provider` _(Object)_: [Data Provider][data-provider] provider or selector instance, or a function as described in the [withDataLoadingError HOC docs](#withdataloadingerrorprovider-custompropertiesnamescomponent)

### `withDataLoadingErrorComponents(provider, [customPropertiesNames])(Component, LoadingComponent, ErrorComponent)`

This HOC works as the already described [`withDataLoadingError`](#withdataloadingerrorprovider-custompropertiesnamescomponent), but it will render one component or another depending of the result. If the provider is loading, it will render `LoadingComponent`, if it has an error, it will render `ErrorComponent` (passing the `error` property to it), or it will render `Component` when there is no error and it is not loading (passing the `data` property to it).

```jsx
import { withDataLoadingErrorComponents } from "@data-provider/react";

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

export default withDataLoadingErrorComponents(books)(BooksList, BooksLoading, BooksError);
```

### `withDataLoadedErrorComponents(provider, [customPropertiesNames])(Component, NotLoadedComponent, ErrorComponent)`

This HOC works as the already described [`withDataLoadedError`](#withdataloadederrorprovider-custompropertiesnamescomponent), but it will render one component or another depending of the result. If the provider has an error, it will render `ErrorComponent` (passing the `error` property to it), if it has not loaded, it will render `NotLoadedComponent`, or it will render `Component` when there is no error and it has loaded (passing the `data` property to it).

```jsx
import { withDataLoadedErrorComponents } from "@data-provider/react";

import { books } from "../data/books";

const BooksList = ({ data }) => {
  // Do your stuff here
};

const BooksNotLoaded = () => {
  // Do your stuff here
};

const BooksError = ({ error }) => {
  // Do your stuff here
};

export default withDataLoadedErrorComponents(books)(BooksList, BooksNotLoaded, BooksError);
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](https://github.com/data-provider/core/blob/master/.github/CONTRIBUTING.md) and [code of conduct](https://github.com/data-provider/core/blob/master/.github/CODE_OF_CONDUCT.md).

[data-provider]: https://www.data-provider.org
[data-provider-selectors]: https://www.data-provider.org/docs/api-selector
[axios]: https://github.com/axios/axios
[get-started]: https://www.data-provider.org/docs/getting-started
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro

[react-redux-hooks]: https://react-redux.js.org/api/hooks
