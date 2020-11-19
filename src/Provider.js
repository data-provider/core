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
  ANY,
  CLEAN_CACHE,
  childEventName,
  isPromise,
  fromEntries,
  defaultOptions,
  throttle,
} from "./helpers";
import { providers } from "./providers";
import { init, resetState, readStart, readSuccess, readError } from "./reducer";
import eventEmitter from "./eventEmitter";

class Provider {
  constructor(id, options, query) {
    this._emitChild = this._emitChild.bind(this);
    this._options = { ...defaultOptions, ...options };
    this._query = { ...query };
    this._tags = removeFalsy(ensureArray(this._options.tags));
    this._children = new Map();
    this._queryMethods = new Map();
    this._queryMethodsParsers = new Map();

    this._id = providers._add(this, id); // initial configuration is made by providers handler

    storeManager.store.dispatch(init(this._id, this.initialState));
  }

  // Private methods

  _eventNamespace(eventName) {
    return eventNamespace(eventName, this._id);
  }

  _emitChild(eventName, child) {
    this.emit(childEventName(eventName), child);
    eventEmitter.emit(this._eventNamespace(childEventName(ANY)), eventName, child);
  }

  _dispatch(action) {
    storeManager.store.dispatch(action);
    this.emit(action.baseType);
  }

  _cleanCacheInterval() {
    if (this._cleanCacheIntervalRef) {
      clearInterval(this._cleanCacheIntervalRef);
    }
  }

  _setCleanCacheInterval(interval, force) {
    if (interval) {
      if (interval !== this._previousCleanCacheInterval || force) {
        this._previousCleanCacheInterval = interval;
        this._cleanCacheInterval();
        this._cleanCacheIntervalRef = setInterval(() => {
          this.cleanCache();
        }, interval);
      }
    } else {
      this._cleanCacheInterval();
    }
  }

  _setCleanCacheThrottle(throttleTime) {
    if (throttleTime) {
      if (throttleTime !== this._previousThrottleTime) {
        this._previousThrottleTime = throttleTime;
        this._throttledCleanCache = throttle(this._unthrottledCleanCache.bind(this), throttleTime);
      }
    } else {
      this._throttledCleanCache = this._unthrottledCleanCache;
    }
  }

  _unthrottledCleanCache() {
    // Reset cacheTime counter
    if (this._cacheTimeOut) {
      clearTimeout(this._cacheTimeOut);
      this._cacheTimeOut = null;
    }
    // Reset cleanCacheInterval
    this._setCleanCacheInterval(this._previousCleanCacheInterval, true);
    this._cache = null;
    this.emit(CLEAN_CACHE);
    this._children.forEach((child) => child.cleanCache());
  }

  // Public methods

  config(options) {
    this._options = { ...this._options, ...options };
    this._setCleanCacheInterval(this._options.cleanCacheInterval);
    this._setCleanCacheThrottle(this._options.cleanCacheThrottle);
    this.configMethod(this._options);
  }

  on(eventName, fn) {
    return eventEmitter.on(this._eventNamespace(eventName), fn);
  }

  onChild(eventName, fn) {
    return eventEmitter.on(this._eventNamespace(childEventName(eventName)), fn);
  }

  once(eventName, fn) {
    return eventEmitter.once(this._eventNamespace(eventName), fn);
  }

  onceChild(eventName, fn) {
    return eventEmitter.once(this._eventNamespace(childEventName(eventName)), fn);
  }

  addQuery(key, queryFunc) {
    const returnQuery = (query) => {
      return this.query(queryFunc(query));
    };
    this._queryMethodsParsers.set(key, queryFunc);
    this._queryMethods.set(key, returnQuery);
  }

  cleanCache(options) {
    this._throttledCleanCache(options);
  }

  cleanDependenciesCache(options) {
    this.cleanCache(options);
  }

  resetState() {
    this._dispatch(resetState(this._id, this.initialState));
    this._children.forEach((child) => child.resetState());
  }

  read(...args) {
    if (this._cache && this._options.cache) {
      return this._cache;
    }
    this._dispatch(readStart(this._id, true));
    let readPromise;
    let error;
    try {
      readPromise = this.readMethod.apply(this, args);
    } catch (err) {
      error = err;
    }

    if (!isPromise(readPromise)) {
      readPromise = error ? Promise.reject(error) : Promise.resolve(readPromise);
    }

    const resultPromise = readPromise
      .then((result) => {
        this._dispatch(readSuccess(this._id, result));
        if (this._options.cacheTime && this._options.cacheTime > 0) {
          this._cacheTimeOut = setTimeout(() => {
            this._cache = null;
          }, this._options.cacheTime);
        }
        return Promise.resolve(result);
      })
      .catch((resultError) => {
        this._dispatch(readError(this._id, resultError));
        this._cache = null;
        return Promise.reject(resultError);
      });
    this._cache = resultPromise;
    return this._cache;
  }

  query(query) {
    if (isUndefined(query)) {
      return this;
    }
    const newQuery = this.getChildQueryMethod(query);
    const id = childId(this._id, newQuery);
    if (this._children.has(id)) {
      return this._children.get(id);
    }
    const child = this.createChildMethod(id, this._options, newQuery);
    this._queryMethodsParsers.forEach((queryMethodParser, queryMethodKey) =>
      child.addQuery(queryMethodKey, queryMethodParser)
    );
    child.on(ANY, (eventName) => this._emitChild(eventName, child));
    this._children.set(id, child);
    child._parent = this;
    return child;
  }

  get store() {
    return storeManager.state[this._id];
  }

  get state() {
    return this.store;
  }

  get id() {
    return this._id;
  }

  get queryValue() {
    return this._query;
  }

  get queries() {
    return fromEntries(this._queryMethods);
  }

  get children() {
    return Array.from(this._children.values());
  }

  get parent() {
    return this._parent;
  }

  get options() {
    return this._options;
  }

  // Methods to be used for testing

  get queryMethods() {
    return fromEntries(this._queryMethodsParsers);
  }

  // Methods to be used only by addons

  get initialStateFromOptions() {
    return isFunction(this._options.initialState)
      ? this._options.initialState(this._query)
      : this._options.initialState;
  }

  emit(eventName, child) {
    eventEmitter.emit(this._eventNamespace(eventName), child);
    eventEmitter.emit(this._eventNamespace(ANY), eventName, child);
  }

  // Methods that can be overwritten by addons

  get initialState() {
    return this.initialStateFromOptions;
  }

  getChildQueryMethod(query) {
    return { ...this.queryValue, ...query };
  }

  createChildMethod(id, options, query) {
    return new this.constructor(id, options, query);
  }

  configMethod() {}

  readMethod() {
    return Promise.resolve(this.state.data);
  }
}

export default Provider;
