/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { Provider } from "@data-provider/core";

const TAG = "memory";

class Memory extends Provider {
  constructor(options, queryValue) {
    super(options, queryValue);
    this._data = this.initialState.data;
    this.options._data = this._options._data || this._data;
  }

  get initialState() {
    let initialState = this.initialStateFromOptions || {};
    if (!initialState.data) {
      initialState.data = {};
    }
    if (this._queriedProp) {
      return {
        ...initialState,
        data: initialState.data[this._queriedProp],
      };
    }
    return initialState;
  }

  get _queriedProp() {
    return this.queryValue && this.queryValue.prop;
  }

  _cleanParentCache() {
    if (this.parent) {
      this.parent._cleanParentCache();
    } else {
      this.cleanCache({ force: true });
    }
  }

  readMethod() {
    if (this._queriedProp) {
      return this._options._data[this._queriedProp];
    }
    return this._options._data;
  }

  update(data) {
    if (this._queriedProp) {
      this._options._data[this._queriedProp] = data;
    } else {
      this._options._data = data;
    }
    this._cleanParentCache();
    return Promise.resolve();
  }

  delete() {
    if (this._queriedProp) {
      delete this._options._data[this._queriedProp];
    } else {
      this._options._data = {};
    }
    this._cleanParentCache();
    return Promise.resolve();
  }

  get baseTags() {
    return TAG;
  }
}

export default Memory;
