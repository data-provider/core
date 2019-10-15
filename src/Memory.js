import { Origin } from "@xbyorange/mercury";
import { cloneDeep } from "lodash";

const TAG = "memory";

const ensureId = id => id || TAG;
const traceLegacyOptions = () => {
  console.warn(
    'Defining "id" as second argument will be deprecated in next major versions of "mercury-memory". Please define an options object with "uuid" property'
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

export class Memory extends Origin {
  constructor(value, receivedId, receivedOptions) {
    const options = getOptions(receivedId, receivedOptions);
    const tags = Array.isArray(options.tags) ? options.tags : [options.tags];
    tags.push(TAG);
    const baseOptions = {
      ...options,
      tags
    };
    if (options.useLegacyDefaultValue) {
      console.warn(
        '"useLegacyDefaultValue" option will be deprecated in next major versions of "mercury-memory"'
      );
    }
    const getDefaultValue = function(query) {
      const valueToReturn = value || {};
      if (query && !options.useLegacyDefaultValue) {
        return valueToReturn[query];
      }
      return valueToReturn;
    };
    super(null, getDefaultValue, baseOptions);
    this._memory = cloneDeep(value || {});
    this.update(this._memory);
  }

  _config(configuration) {
    this._useLegacyDefaultValue = configuration.useLegacyDefaultValue;
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
