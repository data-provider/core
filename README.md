[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fdata-provider%2Fbrowser-storage%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/data-provider/browser-storage/master)

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Data Provider localStorage and sessionStorage origins addon

It provides CRUD methods for objects saved in `localStorage` or `sessionStorage`.

## Usage

Read the [Data Provider][data-provider] docs to learn how to use addons.

* [Home][data-provider]
* [Get started][get-started]
* [Basic tutorial][basic-tutorial]

## Queries

When querying providers created with this addon, the query object can have one of the next properties:

* `prop` _(String)_: Specific property of the object from localStorage or sessionStorage to be accessed.

### Example

```javascript
import { LocalStorage } from "@data-provider/browser-storage";

const userPreferences = new LocalStorage("user-preferences");

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

#### Examples

```javascript
// modify an specific property
userPreferences.query({ prop: "cookiesAccepted" }).update(true);
```

```javascript
// Overwrite full object
userPreferences.update({
  cookiesAccepted: true
});
```

### `delete()`

Removes an specific property of the stored object when the provider is queried, or sets the full object as empty when not. When the object is modified, it will __automatically cleans the cache of the provider__ and also the cache of the parent provider when it is queried _(as deleting a property also modifies the full object)_.

#### Examples

```javascript
// removes an specific property
userPreferences.query({ prop: "cookiesAccepted" }).delete();
```

```javascript
// Sets the full object as {}
userPreferences.delete();
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider]: https://www.data-provider.org
[get-started]: https://www.data-provider.org/docs/getting-started
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro

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
