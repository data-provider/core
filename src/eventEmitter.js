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
    return this.removeListener(fn);
  }

  once(eventName, fn) {
    const onceFn = () => {
      const args = Array.from(arguments);
      this.removeListener(eventName, onceFn);
      fn.apply(this, args);
    };
    this.on(eventName, onceFn);
    return this.removeListener(onceFn);
  }

  emit(eventName, ...args) {
    this._getEventListByName(eventName).forEach(fn => {
      fn.apply(this, args);
    });
  }

  removeListener(eventName, fn) {
    this._getEventListByName(eventName).delete(fn);
  }
}

const eventEmitter = new EventEmitter();

export default eventEmitter;
