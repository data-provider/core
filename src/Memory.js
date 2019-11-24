/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { Provider } from "@data-provider/core";
import { cloneDeep } from "lodash";

const TAG = "memory";

const ensureId = id => id || TAG;

const warn = text => {
  console.warn(`@data-provider/memory: ${text}`);
};

const deprecationWarn = text => {
  warn(`Deprecation warning: ${text}`);
};

const traceLegacyOptions = () => {
  deprecationWarn(
    'Defining "id" as second argument will be deprecated. Please provide an options object with "uuid" property'
  );
};

const getOptions = (receivedId, receivedOptions) => {
  if (receivedOptions) {
    traceLegacyOptions();
    return {
      ...receivedOptions,
      uuid: receivedOptions.uuid || ensureId(receivedId)
    };
  } else if (receivedId && typeof receivedId === "object") {
    return {
      ...receivedId,
      uuid: receivedId.uuid || TAG
    };
  }
  if (receivedId) {
    traceLegacyOptions();
  }
  return {
    uuid: ensureId(receivedId)
  };
};

export class Memory extends Provider {
  constructor(value, receivedId, receivedOptions) {
    const options = getOptions(receivedId, receivedOptions);
    const tags = Array.isArray(options.tags) ? options.tags : [options.tags];
    tags.push(TAG);
    const baseOptions = {
      ...options,
      tags
    };
    if (!options.queriesDefaultValue) {
      deprecationWarn(
        'Usage of "queriesDefaultValue" option is recommended to prepare your code for next major version'
      );
    }
    const getDefaultValue = function(query) {
      const valueToReturn = value || {};
      if (query && options.queriesDefaultValue) {
        return valueToReturn[query];
      }
      return valueToReturn;
    };
    super(null, getDefaultValue, baseOptions);
    this._memory = cloneDeep(value || {});
    this.update(this._memory);
  }

  _read(key) {
    const cached = this._cache.get(key);
    if (cached) {
      return cached;
    }
    const promise = Promise.resolve(key ? this._memory[key] : this._memory);
    this._cache.set(key, promise);
    return promise;
  }

  _update(query, value) {
    const data = cloneDeep(value);
    if (query) {
      this._memory[query] = data;
    } else {
      this._memory = data;
    }
    this._clean();
    return Promise.resolve();
  }

  _create(query, value) {
    this._update(query, value);
    this._clean();
    return Promise.resolve();
  }

  _delete(query) {
    if (query) {
      delete this._memory[query];
    } else {
      this._memory = {};
    }
    this._clean();
    return Promise.resolve();
  }
}
