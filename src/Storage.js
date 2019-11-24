/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/* global window */

import { Provider } from "@data-provider/core";

const TAG = "browser-storage";
const storageKeysTags = {
  localStorage: "local-storage",
  sessionStorage: "session-storage"
};

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

export class Storage extends Provider {
  constructor(namespace, defaultValue, storageKey, options = {}) {
    const tags = Array.isArray(options.tags) ? options.tags : [options.tags];
    tags.push(TAG);
    tags.push(storageKeysTags[storageKey]);
    if (!options.queriesDefaultValue) {
      console.warn(
        '@data-provider/browser-storage: Deprecation warning: Usage of "queriesDefaultValue" option is recommended to prepare your code for next major version'
      );
    }
    const getDefaultValue = function(query) {
      if (query && options.queriesDefaultValue) {
        return defaultValue && defaultValue[query];
      }
      return defaultValue;
    };
    super(null, getDefaultValue, {
      uuid: namespace,
      tags
    });
    this._namespace = namespace;
    this._storage = this._getStorage(storageKey, options.root);
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
    this._clean();
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
