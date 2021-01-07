/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { isFunction, isPromise, ensureArray } from "./helpers";
import Provider from "./Provider";
import CatchDependency from "./CatchDependency";

export function catchDependency(dependency, catchMethod) {
  return new CatchDependency(dependency, catchMethod);
}

export function isDataProvider(objectToCheck) {
  return objectToCheck && objectToCheck instanceof Provider;
}

export function isCatchedDependency(objectToCheck) {
  return objectToCheck && objectToCheck instanceof CatchDependency;
}

export function isDependency(objectToCheck) {
  if (!objectToCheck) {
    return false;
  }
  return (
    isDataProvider(objectToCheck) ||
    isFunction(objectToCheck) ||
    isCatchedDependency(objectToCheck)
  );
}

export function isDependencyExpression(arrayToCheck) {
  return ensureArray(arrayToCheck).reduce((allAreDataProviders, arrayElement) => {
    if (!allAreDataProviders || !isDependency(arrayElement)) {
      return false;
    }
    return true;
  }, true);
}

export function resolveResult(result) {
  return isPromise(result) ? result : Promise.resolve(result);
}
