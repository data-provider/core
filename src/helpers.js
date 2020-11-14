/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

export { default as isPromise } from "is-promise";

let automaticIdCounter = 0;

const CHILD_EVENT_PREFIX = "child-";
const NEW_PROVIDER_PREFIX = "new-provider-";

export const defaultOptions = {
  cache: true,
  reReadDependenciesMaxTime: 5000,
};

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

export function isArray(obj) {
  return Array.isArray(obj);
}

export function isFunction(obj) {
  return typeof obj === "function";
}

export function isUndefined(variable) {
  return typeof variable === "undefined";
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
