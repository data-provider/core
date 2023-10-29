# Important Notice

> **⚠ Project Discontinuation**  
> We regret to inform you that this project is no longer maintained. For an alternative solution, consider using [React Query](https://tanstack.com/query)

<p align="center"><a href="https://data-provider.javierbrea.com" target="_blank" rel="noopener noreferrer"><img width="120" src="https://data-provider.javierbrea.com/img/logo_120.png" alt="Data Provider logo"></a></p>

<p align="center">
  <a href="https://github.com/data-provider/core/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/data-provider/core/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/data-provider/core"><img src="https://codecov.io/gh/data-provider/core/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=data-provider_core_browser-storage"><img src="https://sonarcloud.io/api/project_badges/measure?project=data-provider_core_browser-storage&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@data-provider/browser-storage"><img src="https://img.shields.io/npm/dm/@data-provider/browser-storage.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/data-provider/core/blob/master/packages/browser-storage/LICENSE"><img src="https://img.shields.io/npm/l/@data-provider/browser-storage.svg" alt="License"></a>
</p>

---

# Data Provider localStorage and sessionStorage origins addon

It provides CRUD methods for objects stored in `localStorage` or `sessionStorage`.

## Usage

Create a new provider using the `LocalStorage` or `SessionStorage` classes.

#### Arguments

* `options` _(Object)_: Apart of [common data-provider options](https://data-provider.javierbrea.com/docs/api-provider), this plugin also accept next options:
  * `id` _(String)_: Id of the provider, will be used also as the `key` where the provider data is stored in `localStorage` or `sessionStorage`.
  * `storageFallback` _(Boolean)_: Default `true`. If there is an error trying to access to `window.localStorage` or `window.sessionStorage`, a mock will be used instead, and data will be persisted in memory. This could happen if `localStorage` is disabled by the browser, for example. If you want to handle exceptions by yourself, you can disable this behavior setting this option to `false`, and then all calls to `read`, `update` or `delete` methods will be rejected with the correspondent error, which will be stored also in the `error` property of the provider state.
  * `initialState` _(Object)_: Same option than the one described in the [data-provider API docs](https://data-provider.javierbrea.com/docs/api-provider), except the `data` property, which in this case has no effect, as the initial data set in the state will be the data retrieved synchronously from the real `localStorage` or `sessionStorage`.

#### Example

```javascript
import { LocalStorage } from "@data-provider/browser-storage";

const userPreferences = new LocalStorage({
  id: "user-preferences",
  storageFallback: false
});
// userPreferences object will be stored in localStorage `user-preferences` key.
// If localStorage is disabled, no in-memory mock will be used instead

const sessionData = new SessionStorage({
  id: "user-session"
});
// sessionData object will be stored in sessionStorate `user-session` key.
```

#### Further info

Read the [Data Provider][data-provider] docs for further info about how to use addons.

* [Home][data-provider]
* [Get started][get-started]
* [Basic tutorial][basic-tutorial]

## Queries

When querying providers created with this addon, the query object can have one of the next properties:

* `prop` _(String)_: Specific property of the object from localStorage or sessionStorage to be accessed.

### Example

```javascript
import { LocalStorage } from "@data-provider/browser-storage";

const userPreferences = new LocalStorage({
  id: "user-preferences"
});

userPreferences.query({ prop: "cookiesAccepted" }).update(true);
userPreferences.query({ prop: "cookiesAccepted" }).read().then(result => {
  console.log("Cookies accepted", result);
  // true
});
```

## Custom methods

Apart of the common Data Provider methods, next ones are available:

### `update(data)`

Updates an specific property of the stored object when the provider is queried, or the full object when not. When the object is modified, it will __automatically cleans the cache of the provider__ and also the cache of the parent provider when it is queried _(as modifying a property also modifies the full object)_.

#### Arguments

* `data` _(Any)_: New data to be set. _(Take into account that provided data will be stringified when saved to localStorage)_

#### Returns

A promise that will be resolved when the localStorage is updated, or will be rejected with an error in case the operation fails.

#### Examples

```javascript
// modify an specific property
userPreferences.query({ prop: "cookiesAccepted" }).update(true)
  .then(() => {
    console.log("Local storage updated!");
  })
  .catch(error => {
    console.log("Error updating local storage", error);
  });
```

```javascript
// Overwrite full object
userPreferences.update({
  cookiesAccepted: true
});
```

### `delete()`

Removes an specific property of the stored object when the provider is queried, or sets the full object as empty when not. When the object is modified, it will __automatically cleans the cache of the provider__ and also the cache of the parent provider when it is queried _(as deleting a property also modifies the full object)_.

#### Returns

A promise that will be resolved when the localStorage is updated, or will be rejected with an error in case the operation fails.

#### Examples

```javascript
// removes an specific property
userPreferences.query({ prop: "cookiesAccepted" }).delete()
  .then(() => {
    console.log("Local storage updated");
  })
  .catch(error => {
    console.log("Error updating local storage", error);
  });
```

```javascript
// Sets the full object as {}
userPreferences.delete();
```

## Tags

Providers created with this addon will have automatically the `browser-storage` tag, so you can select all of them together using the `providers` methods as in:

```javascript
import { providers } from "@data-provider/core";

providers.getByTag("browser-storage").cleanCache();
```

Apart of this common tag, each different type of `browser-storage` origin also has next tags:

* `LocalStorage`: "local-storage"
* `SessionStorage`: "session-storage"

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](https://github.com/data-provider/core/blob/master/.github/CONTRIBUTING.md) and [code of conduct](https://github.com/data-provider/core/blob/master/.github/CODE_OF_CONDUCT.md).

[data-provider]: https://data-provider.javierbrea.com
[get-started]: https://data-provider.javierbrea.com/docs/getting-started
[basic-tutorial]: https://data-provider.javierbrea.com/docs/basics-intro
