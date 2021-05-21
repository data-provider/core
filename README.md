[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fdata-provider%2Fmemory%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/data-provider/memory/master)

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Memory origin addon for Data Provider

It provides CRUD methods for objects stored in memory.

## Usage

Read the [Data Provider][data-provider] docs to learn how to use addons.

* [Home][data-provider]
* [Get started][get-started]
* [Basic tutorial][basic-tutorial]

## Queries

When querying providers created with this addon, the query object can have one of the next properties:

* `prop` _(String)_: Specific property of the object to be accessed.

### Example

```javascript
import { Memory } from "@data-provider/memory";

const sessionStatus = new Memory({
  id: "session-status",
  initialState: {
    data: {
      loggedIn: false
    }
  }
});

sessionStatus.query({ prop: "loggedIn" }).update(true);
sessionStatus.query({ prop: "loggedIn" }).read().then(result => {
  console.log("Is logged in", result);
  // true
});
```

## Custom methods

Apart of the common Data Provider methods, next ones are available:

### `update(data)`

Updates an specific property of the stored object when the provider is queried, or the full object when not. When the object is modified, it will __automatically cleans the cache of the provider__ and also the cache of the parent provider when it is queried _(as modifying a property also modifies the full object)_.

#### Arguments

* `data` _(Any)_: New data to be set.

#### Examples

```javascript
// modifies an specific property
sessionStatus.query({ prop: "loggedIn" }).update(true);
```

```javascript
// Overwrites full object
sessionStatus.update({
  loggedIn: true
});
```

### `delete()`

Removes an specific property of the stored object when the provider is queried, or sets the full object as empty when not. When the object is modified, it will __automatically cleans the cache of the provider__ and also the cache of the parent provider when it is queried _(as deleting a property also modifies the full object)_.

#### Examples

```javascript
// removes an specific property
sessionStatus.query({ prop: "loggedIn" }).delete();
```

```javascript
// Sets the full object as {}
sessionStatus.delete();
```

## Tags

Providers created with this addon will have automatically the `memory` tag, so you can select all of them together using the `providers` methods as in:

```javascript
import { providers } from "@data-provider/core";

providers.getByTag("memory").cleanCache();
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[data-provider]: https://www.data-provider.org
[get-started]: https://www.data-provider.org/docs/getting-started
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro

[coveralls-image]: https://coveralls.io/repos/github/data-provider/memory/badge.svg
[coveralls-url]: https://coveralls.io/github/data-provider/memory
[build-image]: https://github.com/data-provider/memory/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/data-provider/memory/actions?query=workflow%3Abuild+branch%3Amaster
[last-commit-image]: https://img.shields.io/github/last-commit/data-provider/memory.svg
[last-commit-url]: https://github.com/data-provider/memory/commits
[license-image]: https://img.shields.io/npm/l/@data-provider/memory.svg
[license-url]: https://github.com/data-provider/memory/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@data-provider/memory.svg
[npm-downloads-url]: https://www.npmjs.com/package/@data-provider/memory
[npm-dependencies-image]: https://img.shields.io/david/data-provider/memory.svg
[npm-dependencies-url]: https://david-dm.org/data-provider/memory
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=data-provider_memory&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=data-provider_memory
[release-image]: https://img.shields.io/github/release-date/data-provider/memory.svg
[release-url]: https://github.com/data-provider/memory/releases
