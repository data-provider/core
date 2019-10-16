/* global window */

import { Origin } from "@xbyorange/mercury";

class StorageMock {
  constructor() {
    this._value = "{}";
  }

  getItem() {
    return this._value;
  }

  setItem(namespace, value) {
    this._value = value;
  }
}

export class Storage extends Origin {
  constructor(namespace, defaultValue, storageKey, root) {
    super(`${storageKey}-${namespace}`, defaultValue);
    this._namespace = namespace;
    this._storage = this._getStorage(storageKey, root);
  }

  _getStorage(storageKey, root) {
    if (root && root[storageKey]) {
      return root[storageKey];
    }
    try {
      return window[storageKey];
    } catch (err) {
      return new StorageMock();
    }
  }

  _getRootValue() {
    const rootValue = this._storage.getItem(this._namespace);
    return rootValue ? JSON.parse(rootValue) : {};
  }

  _setRootValue(value) {
    this._storage.setItem(this._namespace, JSON.stringify(value));
  }

  _read(key) {
    const cached = this._cache.get(key);
    if (cached) {
      return cached;
    }
    const promise = Promise.resolve(key ? this._getRootValue()[key] : this._getRootValue());
    this._cache.set(key, promise);
    return promise;
  }

  _update(filter, data) {
    let rootValue;
    if (filter) {
      rootValue = this._getRootValue();
      rootValue[filter] = data;
    } else {
      rootValue = data;
    }
    this._setRootValue(rootValue);
    this._clean(filter);
    return Promise.resolve();
  }

  _create(filter, data) {
    this._update(filter, data);
    this._clean();
    return Promise.resolve();
  }

  _delete(filter) {
    let rootValue = this._getRootValue();
    if (filter) {
      delete rootValue[filter];
    } else {
      rootValue = {};
    }
    this._setRootValue(rootValue);
    this._clean();
    return Promise.resolve();
  }
}
