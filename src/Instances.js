/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { ensureArray, mergeCloned, removeFalsy } from "./helpers";

export class InstancesHandler {
  constructor(baseTags) {
    this._baseTags = removeFalsy(ensureArray(baseTags));
    this._config = {};
    this._instances = new Set();
  }

  _add(instance) {
    this._instances.add(instance);
    instance.config(this._config);
    return this;
  }

  config(options) {
    this._config = mergeCloned(this._config, options);
    this._instances.forEach(instance => instance.config(this._config));
  }

  clean() {
    this._instances.forEach(instance => instance.clean());
    return this;
  }

  // TODO, add onClean, onceClean, removeCleanListener, onChange and removeChangeListener

  call() {
    const args = Array.from(arguments);
    const methodName = args[0];
    args.shift();
    return this.elements.map(instance => {
      if (instance[methodName] instanceof Function) {
        return instance[methodName].apply(instance, args);
      } else {
        console.warn(
          `@data-provider instance with id "${instance._id}" has not method "${methodName}"`
        );
      }
    });
  }

  clear() {
    this._instances.clear();
    this._config = {};
    return this;
  }

  get size() {
    return this._instances.size;
  }

  get elements() {
    return Array.from(this._instances.values());
  }
}

export class Instances {
  constructor() {
    this._allInstances = new InstancesHandler();
    this._tags = new Map();
    this._allInstancesById = new Map();
  }

  _createIdEmptyGroup(id) {
    const instancesHandler = new InstancesHandler();
    this._allInstancesById.set(id, instancesHandler);
    return instancesHandler;
  }

  _createTagEmptyGroup(tag) {
    const instancesHandler = new InstancesHandler(tag);
    this._tags.set(tag, instancesHandler);
    return instancesHandler;
  }

  getByTag(tag) {
    return this._tags.get(tag) || this._createTagEmptyGroup(tag);
  }

  getById(id) {
    return this._allInstancesById.get(id) || this._createIdEmptyGroup(id);
  }

  _add(instance) {
    const idGroup = this._allInstancesById.get(instance._id);
    if (idGroup) {
      if (idGroup.size > 0) {
        console.warn(`@data-provider: Duplicated instance id "${instance._id}"`);
        this._createIdEmptyGroup(instance._id)._add(instance);
      } else {
        idGroup._add(instance);
      }
    } else {
      this._createIdEmptyGroup(instance._id)._add(instance);
    }
    this._allInstances._add(instance);
    instance._tags.forEach(tag => {
      this.getByTag(tag)._add(instance);
    });
    return this;
  }

  clear() {
    this._allInstances.clear();
    this._allInstancesById.clear();
    this._tags.clear();
    return this._allInstances.clear();
  }

  // Expose methods of all instances
  config(options) {
    return this._allInstances.config(options);
  }

  clean() {
    return this._allInstances.clean();
  }

  call() {
    return this._allInstances.call.apply(this._allInstances, arguments);
  }

  get size() {
    return this._allInstances.size;
  }

  get elements() {
    return this._allInstances.elements;
  }
}

export const instances = new Instances();
