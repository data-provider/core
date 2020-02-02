/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { once } from "lodash";
export { default as isPromise } from "is-promise";

let automaticIdCounter = 0;

const CHILD_EVENT_PREFIX = "child-";

export { once };

export const ANY_EVENT = "*";

export const childEventName = eventName =>
  `${CHILD_EVENT_PREFIX}${eventName.replace(CHILD_EVENT_PREFIX, "")}`;

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
  return (Date.now() + automaticIdCounter).toString();
}

export function ensureArray(els) {
  return isArray(els) ? els : [els];
}

export function removeFalsy(array) {
  return array.filter(el => !!el);
}

export const message = text => {
  return `@data-provider/core: ${text}`;
};

export function warn(text) {
  console.warn(message(text));
}
