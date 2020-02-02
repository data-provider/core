/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { storeManager } from "./storeManager";
import {
  childId,
  eventNamespace,
  removeFalsy,
  ensureArray,
  isFunction,
  isUndefined,
  merge,
  ANY_EVENT,
  childEventName,
  getAutomaticId
} from "./helpers";
import { providers } from "./providers";
import { init, cleanCache, cleanState, readStart, readSuccess, readError } from "./reducer";
import eventEmitter from "./eventEmitter";

class Provider {
  constructor(id, options, query) {
    this._emitChild = this._emitChild.bind(this);
    this._id = id || getAutomaticId();
    this._options = { ...options };
    this._query = { ...query };
    this._tags = removeFalsy(ensureArray(this._options.tags));
    this._children = new Map();
    this._customQueries = new Map();
    this._queries = new Map();

    providers._add(this); // initial configuration is made by providers handler

    this._dispatch(init(this._id, this._getInitialData()));
  }

  _getInitialData() {
    return (
      (isFunction(this._options.initialData)
        ? this._options.initialData(this._query)
        : this._options.initialData) || null
    );
  }

  _eventNamespace(eventName) {
    return eventNamespace(eventName, this._id);
  }

  _emitChild(eventName, data) {
    const prefixedEventName = childEventName(eventName);
    this.emit(prefixedEventName, data);
    eventEmitter.emit(this._eventNamespace(childEventName(ANY_EVENT)), eventName, data);
  }

  _dispatch(action, data) {
    const prevState = this.store;
    storeManager.store.dispatch(action, data);
    this.emit(action.baseType, prevState, this.store);
  }

  // Public methods

  emit(eventName, data) {
    // console.log("emitting", this._eventNamespace(eventName));
    // console.log("emitting", this._eventNamespace(ANY_EVENT));
    eventEmitter.emit(this._eventNamespace(eventName), data);
    eventEmitter.emit(this._eventNamespace(ANY_EVENT), eventName, data);
  }

  config(options) {
    this._options = { ...this._options, ...options };
    this.configMethod(this._options);
  }

  on(eventName, fn) {
    return eventEmitter.on(this._eventNamespace(eventName), fn);
  }

  onChild(eventName, fn) {
    // console.log(this._eventNamespace(childEventName(eventName)));
    return eventEmitter.on(this._eventNamespace(childEventName(eventName)), fn);
  }

  once(eventName, fn) {
    return eventEmitter.once(this._eventNamespace(eventName), fn);
  }

  onceChild(eventName, fn) {
    return eventEmitter.once(this._eventNamespace(childEventName(eventName)), fn);
  }

  setQuery(key, queryFunc) {
    const returnQuery = query => {
      return this.query(queryFunc(query));
    };
    this._customQueries.set(key, queryFunc);
    this._queries.set(key, returnQuery);
  }

  cleanCache() {
    this._cache = null;
    this._dispatch(cleanCache(this._id));
    this._children.forEach(child => child.cleanCache());
  }

  cleanState() {
    this._dispatch(cleanState(this._id), this._getInitialData());
    this._children.forEach(child => child.cleanState());
  }

  read() {
    if (this._cache) {
      return this._cache;
    }
    // TODO, custom dispatcher, add event name and prevState
    this._dispatch(readStart(this._id, true));
    const args = Array.from(arguments);
    const readPromise = this.readMethod
      .apply(this, args)
      .then(result => {
        this._dispatch(readSuccess(this._id, result));
        return Promise.resolve(result);
      })
      .catch(error => {
        this._dispatch(readError(this._id, error));
        this._cache = null;
        return Promise.reject(error);
      });
    this._cache = readPromise;
    return this._cache;
  }

  query(query) {
    if (isUndefined(query)) {
      return this;
    }
    const newQuery = merge({}, this._query, query);
    const id = childId(this._id, newQuery);
    if (this._children.has(id)) {
      return this._children.get(id);
    }
    const child = this.queryMethod(id, this._options, newQuery);
    this._customQueries.forEach((customQuery, customQueryKey) =>
      child.setQuery(customQueryKey, customQuery)
    );
    child.on(ANY_EVENT, this._emitChild);
    this._children.set(id, child);
    return child;
  }

  get store() {
    return storeManager.state[this._id];
  }

  get state() {
    return this.store.state;
  }

  get stats() {
    return this.store.stats;
  }

  get id() {
    return this._id;
  }

  get queries() {
    return Object.fromEntries(this._queries);
  }

  // Methods to be overwritten

  queryMethod(id, options, query) {
    return new this.constructor(id, options, query);
  }

  configMethod() {}

  readMethod() {
    return Promise.resolve(this.state.data);
  }
}

export default Provider;
