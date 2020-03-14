/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { isUndefined } from "./helpers";

export class EventEmitter {
  constructor() {
    this.events = {};
  }

  _getEventListByName(eventName) {
    if (isUndefined(this.events[eventName])) {
      this.events[eventName] = new Set();
    }
    return this.events[eventName];
  }

  on(eventName, fn) {
    this._getEventListByName(eventName).add(fn);
    return this._createRemoveListener(eventName, fn);
  }

  once(eventName, fn) {
    const onceFn = (...args) => {
      fn.apply(null, args);
      this.removeListener(eventName, onceFn);
    };
    this.on(eventName, onceFn);
    return this._createRemoveListener(eventName, onceFn);
  }

  emit(eventName, ...args) {
    this._getEventListByName(eventName).forEach(fn => {
      fn.apply(null, args);
    });
  }

  _createRemoveListener(eventName, fn) {
    return () => {
      this.removeListener(eventName, fn);
    };
  }

  removeListener(eventName, fn) {
    this._getEventListByName(eventName).delete(fn);
  }
}

const eventEmitter = new EventEmitter();

export default eventEmitter;
