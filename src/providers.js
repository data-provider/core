/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { ensureArray, mergeCloned, removeFalsy, warn } from "./helpers";

export class ProvidersHandler {
  constructor(baseTags) {
    this._baseTags = removeFalsy(ensureArray(baseTags));
    this._config = {};
    this._providers = new Set();
  }

  _add(provider) {
    this._providers.add(provider);
    provider.config(this._config);
    return this;
  }

  config(options) {
    this._config = mergeCloned(this._config, options);
    this._providers.forEach(provider => provider.config(this._config));
  }

  cleanCache() {
    this._providers.forEach(provider => provider.cleanCache());
    return this;
  }

  cleanState() {
    this._providers.forEach(provider => provider.cleanState());
    return this;
  }

  // TODO, add on, onChild, once, onChild methods

  call() {
    const args = Array.from(arguments);
    const methodName = args[0];
    args.shift();
    return this.elements.map(provider => {
      if (provider[methodName] instanceof Function) {
        return provider[methodName].apply(provider, args);
      } else {
        warn(`Provider with id "${provider._id}" has not method "${methodName}"`);
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

  getByTag(tag) {
    return this._tags.get(tag) || this._createTagEmptyGroup(tag);
  }

  getById(id) {
    return this._allProvidersById.get(id) || this._createIdEmptyGroup(id);
  }

  _add(provider) {
    const idGroup = this._allProvidersById.get(provider._id);
    if (idGroup) {
      if (idGroup.size > 0) {
        warn(`Duplicated provider id "${provider._id}"`);
        this._createIdEmptyGroup(provider._id)._add(provider);
      } else {
        idGroup._add(provider);
      }
    } else {
      this._createIdEmptyGroup(provider._id)._add(provider);
    }
    this._allProviders._add(provider);
    provider._tags.forEach(tag => {
      this.getByTag(tag)._add(provider);
    });
    return this;
  }

  clear() {
    this._allProviders.clear();
    this._allProvidersById.clear();
    this._tags.clear();
    return this._allProviders.clear();
  }

  // Expose methods of all providers
  config(options) {
    return this._allProviders.config(options);
  }

  cleanCache() {
    return this._allProviders.cleanCache();
  }

  cleanState() {
    return this._allProviders.cleanState();
  }

  call() {
    return this._allProviders.call.apply(this._allProviders, arguments);
  }

  get size() {
    return this._allProviders.size;
  }

  get elements() {
    return this._allProviders.elements;
  }
}

export const providers = new Providers();
