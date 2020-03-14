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
  constructor(id, options, query) {
    const tags = options.tags || [];
    tags.unshift(storageKeysTags[options.storageKey]);
    tags.unshift(TAG);
    super(id, { ...options, tags }, query);
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

  get initialState() {
    let initialState = this.initialStateFromOptions || {};
    this._namespace = this.id;
    this._storage = this._getStorage(this.options.storageKey, this.options.root);
    return {
      ...initialState,
      data: this.readMethod()
    };
  }

  get _queriedProp() {
    return this.queryValue && this.queryValue.prop;
  }

  readMethod() {
    const queryProp = this._queriedProp;
    const rootValue = this._getRootValue();
    if (queryProp) {
      return rootValue[queryProp];
    }
    return rootValue;
  }

  _cleanParentCache() {
    if (this.parent) {
      this.parent._cleanParentCache();
    } else {
      this.cleanCache();
    }
  }

  update(data) {
    let rootValue;
    const queryProp = this._queriedProp;
    if (queryProp) {
      rootValue = this._getRootValue();
      rootValue[queryProp] = data;
    } else {
      rootValue = data;
    }
    this._setRootValue(rootValue);
    this._cleanParentCache();
    return Promise.resolve();
  }

  delete() {
    let rootValue = this._getRootValue();
    const queryProp = this._queriedProp;
    if (queryProp) {
      delete rootValue[queryProp];
    } else {
      rootValue = {};
    }
    this._setRootValue(rootValue);
    this._cleanParentCache();
    return Promise.resolve();
  }
}
