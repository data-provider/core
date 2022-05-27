/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { ensureArray, removeFalsy, warn, getAutomaticId, newProviderEventName } from "./helpers";
import eventEmitter from "./eventEmitter";

export class ProvidersHandler {
  constructor(baseTags) {
    this._newProviderEventName = newProviderEventName(getAutomaticId());
    this._baseTags = removeFalsy(ensureArray(baseTags));
    this._config = {};
    this._providers = new Set();
  }

  _add(provider, id) {
    provider._id = id;
    this._providers.add(provider);
    provider.config(this._config);
    eventEmitter.emit(this._newProviderEventName, provider);
    return this;
  }

  _run(method, options) {
    this._providers.forEach((provider) => provider[method](options));
    return this;
  }

  _addListener(method, eventName, fn) {
    const removeListenersFuncs = this.call.apply(this, [method, eventName, fn]);
    return () => {
      removeListenersFuncs.forEach((removeListener) => removeListener());
    };
  }

  onNewProvider(cb) {
    return eventEmitter.on(this._newProviderEventName, cb);
  }

  config(options) {
    this._config = { ...this._config, ...options };
    this._providers.forEach((provider) => provider.config(this._config));
    return this;
  }

  cleanCache(options) {
    return this._run("cleanCache", options);
  }

  cleanDependenciesCache(options) {
    return this._run("cleanDependenciesCache", options);
  }

  resetState() {
    return this._run("resetState");
  }

  on(eventName, fn) {
    return this._addListener("on", eventName, fn);
  }

  onChild(eventName, fn) {
    return this._addListener("onChild", eventName, fn);
  }

  once(eventName, fn) {
    return this._addListener("once", eventName, fn);
  }

  onceChild(eventName, fn) {
    return this._addListener("onceChild", eventName, fn);
  }

  call(...args) {
    const methodName = args[0];
    args.shift();
    return this.elements.map((provider) => {
      if (provider[methodName] instanceof Function) {
        return provider[methodName].apply(provider, args);
      } else {
        warn(`"${provider._id}" has not method "${methodName}"`);
      }
    });
  }

  clear() {
    this._providers.clear();
    this._config = {};
    return this;
  }

  get size() {
    return this._providers.size;
  }

  get elements() {
    return Array.from(this._providers.values());
  }
}

export class Providers {
  constructor() {
    this._allProviders = new ProvidersHandler();
    this._tags = new Map();
    this._allProvidersById = new Map();
  }

  _createIdEmptyGroup(id) {
    const providersHandler = new ProvidersHandler();
    this._allProvidersById.set(id, providersHandler);
    return providersHandler;
  }

  _createTagEmptyGroup(tag) {
    const providersHandler = new ProvidersHandler(tag);
    this._tags.set(tag, providersHandler);
    return providersHandler;
  }

  _add(provider, id) {
    let providerId = id || getAutomaticId();
    const idGroup = this._allProvidersById.get(providerId);
    if (idGroup) {
      if (idGroup.size > 0) {
        const originalId = providerId;
        providerId = `${providerId}-${getAutomaticId()}`;
        warn(`Duplicated id "${originalId}". Changed to "${providerId}"`);
        this._createIdEmptyGroup(providerId)._add(provider, providerId);
      } else {
        idGroup._add(provider, providerId);
      }
    } else {
      this._createIdEmptyGroup(providerId)._add(provider, providerId);
    }
    this._allProviders._add(provider, providerId);
    provider._tags.forEach((tag) => {
      this.getByTag(tag)._add(provider, providerId);
    });
    return providerId;
  }

  // For internal usage

  clear() {
    this._allProvidersById.clear();
    this._tags.clear();
    return this._allProviders.clear();
  }

  // Public methods

  onNewProvider(cb) {
    return this._allProviders.onNewProvider(cb);
  }

  getByTag(tag) {
    return this._tags.get(tag) || this._createTagEmptyGroup(tag);
  }

  getById(id) {
    return this._allProvidersById.get(id) || this._createIdEmptyGroup(id);
  }

  // Expose methods of all providers
  config(options) {
    return this._allProviders.config(options);
  }

  cleanCache(options) {
    return this._allProviders.cleanCache(options);
  }

  cleanDependenciesCache(options) {
    return this._allProviders.cleanDependenciesCache(options);
  }

  resetState() {
    return this._allProviders.resetState();
  }

  on(eventName, fn) {
    return this._allProviders.on(eventName, fn);
  }

  onChild(eventName, fn) {
    return this._allProviders.onChild(eventName, fn);
  }

  once(eventName, fn) {
    return this._allProviders.once(eventName, fn);
  }

  onceChild(eventName, fn) {
    return this._allProviders.onceChild(eventName, fn);
  }

  call(...args) {
    return this._allProviders.call.apply(this._allProviders, args);
  }

  get size() {
    return this._allProviders.size;
  }

  get elements() {
    return this._allProviders.elements;
  }
}

export const providers = new Providers();
