/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { cloneDeep, merge, isFunction } from "lodash";

const CACHE_EVENT_PREFIX = "clean-cache-";
const CHANGE_EVENT_PREFIX = "change-";
const ANY_SUFIX = "any";

export const CREATE_METHOD = "create";
export const READ_METHOD = "read";
export const UPDATE_METHOD = "update";
export const DELETE_METHOD = "delete";

export const DISPATCH = "Dispatch";
export const SUCCESS = "Success";
export const ERROR = "Error";

export const VALID_METHODS = [CREATE_METHOD, READ_METHOD, UPDATE_METHOD, DELETE_METHOD];

export const CHANGE_ANY_EVENT_NAME = `${CHANGE_EVENT_PREFIX}${ANY_SUFIX}`;
export const CLEAN_ANY_EVENT_NAME = `${CACHE_EVENT_PREFIX}${ANY_SUFIX}`;

export const isCacheEventName = eventName =>
  eventName.indexOf(CACHE_EVENT_PREFIX) === 0 && eventName !== CLEAN_ANY_EVENT_NAME;

export const cleanCacheEventName = query => `${CACHE_EVENT_PREFIX}${queryId(query)}`;
export const changeEventName = query => `${CHANGE_EVENT_PREFIX}${queryId(query)}`;

export const actions = {
  [CREATE_METHOD]: {
    dispatch: `${CREATE_METHOD}${DISPATCH}`,
    success: `${CREATE_METHOD}${SUCCESS}`,
    error: `${CREATE_METHOD}${ERROR}`
  },
  [UPDATE_METHOD]: {
    dispatch: `${UPDATE_METHOD}${DISPATCH}`,
    success: `${UPDATE_METHOD}${SUCCESS}`,
    error: `${UPDATE_METHOD}${ERROR}`
  },
  [READ_METHOD]: {
    dispatch: `${READ_METHOD}${DISPATCH}`,
    success: `${READ_METHOD}${SUCCESS}`,
    error: `${READ_METHOD}${ERROR}`
  },
  [DELETE_METHOD]: {
    dispatch: `${DELETE_METHOD}${DISPATCH}`,
    success: `${DELETE_METHOD}${SUCCESS}`,
    error: `${DELETE_METHOD}${ERROR}`
  }
};

export const hash = str => {
  return `${str.split("").reduce((a, b) => {
    const c = (a << 5) - a + b.charCodeAt(0);
    return c & c;
  }, 0)}`;
};

export const mergeCloned = (dest, origin) => merge(dest, cloneDeep(origin));

export const removeFalsy = array => array.filter(el => !!el);

export const isUndefined = variable => typeof variable === "undefined";

export const queryId = query => (isUndefined(query) ? query : `(${JSON.stringify(query)})`);

export const dashJoin = arr => arr.filter(val => !isUndefined(val)).join("-");

export const uniqueId = (id, defaultValue) =>
  hash(`${id}${isFunction(defaultValue) ? "" : JSON.stringify(defaultValue)}`);

export const queriedUniqueId = (uuid, queryUniqueId) => dashJoin([uuid, queryUniqueId]);

export const ensureArray = els => (Array.isArray(els) ? els : [els]);

export const seemsToBeSelectorOptions = defaultValueOrOptions => {
  if (!defaultValueOrOptions) {
    return false;
  }
  return (
    defaultValueOrOptions.hasOwnProperty("defaultValue") ||
    defaultValueOrOptions.hasOwnProperty("uuid")
  );
};

export const isDataProvider = objectToCheck => {
  return (
    objectToCheck &&
    (objectToCheck._isDataProvider === true ||
      (objectToCheck.provider && objectToCheck.provider._isDataProvider) ||
      (objectToCheck.source && objectToCheck.source._isDataProvider)) // TODO, deprecate
  );
};

export const areDataProviders = arrayToCheck => {
  let allAreDataProviders = true;
  ensureArray(arrayToCheck).forEach(arrayElement => {
    if (!isDataProvider(arrayElement)) {
      allAreDataProviders = false;
    }
  });
  return allAreDataProviders;
};

export const message = text => {
  return `@data-provider/core: ${text}`;
};

export const warn = text => {
  console.warn(message(text));
};

export const deprecationWarn = text => {
  warn(`Deprecation warning: ${text}`);
};
