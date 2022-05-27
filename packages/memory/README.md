<p align="center"><a href="https://www.data-provider.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.data-provider.org/img/logo_120.png" alt="Data Provider logo"></a></p>

<p align="center">
  <a href="https://github.com/data-provider/core/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/data-provider/core/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/data-provider/core"><img src="https://codecov.io/gh/data-provider/core/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=data-provider_core_memory"><img src="https://sonarcloud.io/api/project_badges/measure?project=data-provider_core_memory&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@data-provider/memory"><img src="https://img.shields.io/npm/dm/@data-provider/memory.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/data-provider/core/blob/master/packages/memory/LICENSE"><img src="https://img.shields.io/npm/l/@data-provider/memory.svg" alt="License"></a>
</p>

---

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
Please read the [contributing guidelines](https://github.com/data-provider/core/blob/master/.github/CONTRIBUTING.md) and [code of conduct](https://github.com/data-provider/core/blob/master/.github/CODE_OF_CONDUCT.md).

[data-provider]: https://www.data-provider.org
[get-started]: https://www.data-provider.org/docs/getting-started
[basic-tutorial]: https://www.data-provider.org/docs/basics-intro
