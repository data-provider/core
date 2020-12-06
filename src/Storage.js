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
  sessionStorage: "session-storage",
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

class StorageErrorMock {
  constructor(error) {
    this._error = error;
  }

  getItem() {
    throw this._error;
  }

  setItem() {
    throw this._error;
  }
}

export class Storage extends Provider {
  constructor(id, options, query) {
    const tags = options.tags ? [...options.tags] : [];
    tags.unshift(storageKeysTags[options.storageKey]);
    tags.unshift(TAG);
    const extendedOptions = { ...options, tags };
    if (!query) {
      extendedOptions.parentId = id;
    }
    super(id, extendedOptions, query);
  }

  _getStorage(storageKey, root, storageFallback) {
    if (root && root[storageKey]) {
      return root[storageKey];
    }
    try {
      return window[storageKey];
    } catch (error) {
      if (storageFallback === false) {
        return new StorageErrorMock(error);
      }
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

  get initialState() {
    let initialState = this.initialStateFromOptions || {};
    this._namespace = this.options.parentId;
    this._storage = this._getStorage(
      this.options.storageKey,
      this.options.root,
      this.options.storageFallback
    );
    return {
      ...initialState,
      data: this.readSync(),
    };
  }

  get _queriedProp() {
    return this.queryValue && this.queryValue.prop;
  }

  readSync() {
    const queryProp = this._queriedProp;
    let rootValue;
    try {
      rootValue = this._getRootValue();
    } catch (err) {
      rootValue = {};
    }
    if (queryProp) {
      return rootValue[queryProp];
    }
    return rootValue;
  }

  readMethod() {
    return new Promise((resolve, reject) => {
      let rootValue;
      const queryProp = this._queriedProp;
      try {
        rootValue = this._getRootValue();
        if (queryProp) {
          resolve(rootValue[queryProp]);
        }
        resolve(rootValue);
      } catch (err) {
        reject(err);
      }
    });
  }

  _cleanParentCache() {
    if (this.parent) {
      this.parent._cleanParentCache();
    } else {
      this.cleanCache({ force: true });
    }
  }

  update(data) {
    return new Promise((resolve, reject) => {
      let rootValue;
      const queryProp = this._queriedProp;
      try {
        if (queryProp) {
          rootValue = this._getRootValue();
          rootValue[queryProp] = data;
        } else {
          rootValue = data;
        }
        this._setRootValue(rootValue);
        this._cleanParentCache();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  delete() {
    return new Promise((resolve, reject) => {
      let rootValue = this._getRootValue();
      const queryProp = this._queriedProp;
      try {
        if (queryProp) {
          delete rootValue[queryProp];
        } else {
          rootValue = {};
        }
        this._setRootValue(rootValue);
        this._cleanParentCache();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
