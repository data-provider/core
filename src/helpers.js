/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

export { default as isPromise } from "is-promise";
export { default as isPlainObject } from "lodash.isplainobject";

let automaticIdCounter = 0;

const CHILD_EVENT_PREFIX = "child-";
const NEW_PROVIDER_PREFIX = "new-provider-";

export const defaultOptions = {
  cache: true,
  cacheTime: null,
  cleanCacheInterval: null,
  reReadDependenciesMaxTime: 5000,
  readAgainMaxTime: 5000,
  cleanCacheThrottle: 0,
};

export const SELECTORS_TAG = "selector";
export const INIT = "init";
export const CLEAN_CACHE = "cleanCache";
export const RESET_STATE = "resetState";
export const READ_START = "readStart";
export const READ_SUCCESS = "readSuccess";
export const READ_ERROR = "readError";
export const MIGRATE_STORE = "migrateStore";
export const ANY = "*";

export const eventNames = {
  INIT,
  CLEAN_CACHE,
  RESET_STATE,
  READ_START,
  READ_SUCCESS,
  READ_ERROR,
  ANY,
};

export function newProviderEventName(groupId) {
  return `${NEW_PROVIDER_PREFIX}${groupId}`;
}

export function childEventName(eventName) {
  return `${CHILD_EVENT_PREFIX}${eventName.replace(CHILD_EVENT_PREFIX, "")}`;
}

export function isString(value) {
  return typeof value === "string";
}

export function isArray(value) {
  return Array.isArray(value);
}

export function isFunction(value) {
  return typeof value === "function";
}

export function isUndefined(value) {
  return typeof value === "undefined";
}

export function queryId(query) {
  return isUndefined(query) ? query : `(${JSON.stringify(query)})`;
}

export function childId(id, query) {
  return `${id}${queryId(query)}`;
}

export function eventNamespace(eventName, id) {
  return `${eventName}-${id}`;
}

export function getAutomaticId() {
  automaticIdCounter++;
  return `${Date.now()}_${automaticIdCounter}`;
}

export function ensureArray(els) {
  return isArray(els) ? els : [els];
}

export function removeFalsy(array) {
  return array.filter((el) => !!el);
}

export function arrayWithoutFalsies(els) {
  return removeFalsy(ensureArray(els));
}

export function message(text) {
  return `@data-provider/core: ${text}`;
}

export function warn(text) {
  console.warn(message(text));
}

// TODO, remove when node 10 is not maintained
export function fromEntriesPolyfill(map) {
  return Array.from(map.entries()).reduce((accumulator, [key, value]) => {
    accumulator[key] = value;
    return accumulator;
  }, {});
}

export function fromEntries(map) {
  // TODO, remove when node 10 is not maintained
  if (Object.fromEntries) {
    return Object.fromEntries(map);
  }
  return fromEntriesPolyfill(map);
}

export function throttle(func, limit) {
  let inThrottle = false;
  let calledWhileInThrottle = false;
  let finishThrottleTimeout = null;
  const checkFinishThrottle = (context, args) => {
    finishThrottleTimeout = setTimeout(() => {
      if (calledWhileInThrottle) {
        inThrottle = true;
        calledWhileInThrottle = false;
        checkFinishThrottle(context, args);
        func.apply(context, args);
      } else {
        inThrottle = false;
      }
    }, limit);
  };
  return function (options = {}) {
    const context = this;
    if (!inThrottle || options.force) {
      if (options.force) {
        clearTimeout(finishThrottleTimeout);
      }
      inThrottle = true;
      calledWhileInThrottle = false;
      checkFinishThrottle(context, arguments);
      func.apply(context, arguments);
    } else {
      calledWhileInThrottle = true;
    }
  };
}

/* Backward compatibility with v2. Accepts:
- id as first argument and options as second argument
- options as first argument with id as a property
*/
export function providerArgsV3(args) {
  if (isString(args[0])) {
    return [args[0], args[1], args[2]];
  }
  if (!!args[0]) {
    return [args[0].id, args[0], args[1]];
  }
  return args;
}
