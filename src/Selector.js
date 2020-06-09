/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { CLEAN_CACHE, isFunction, isArray, isPromise, ensureArray } from "./helpers";
import Provider from "./Provider";
import CatchDependency from "./CatchDependency";

export function catchDependency(dependency, catchMethod) {
  return new CatchDependency(dependency, catchMethod);
}

const isDataProvider = (objectToCheck) => {
  return objectToCheck && objectToCheck instanceof Provider;
};

const isCatchedDependency = (objectToCheck) => {
  return objectToCheck && objectToCheck instanceof CatchDependency;
};

const isDependency = (objectToCheck) => {
  if (!objectToCheck) {
    return false;
  }
  return (
    isDataProvider(objectToCheck) ||
    isFunction(objectToCheck) ||
    isCatchedDependency(objectToCheck)
  );
};

const isDependencyExpression = (arrayToCheck) => {
  return ensureArray(arrayToCheck).reduce((allAreDataProviders, arrayElement) => {
    if (!allAreDataProviders || !isDependency(arrayElement)) {
      return false;
    }
    return true;
  }, true);
};

const resolveResult = (result) => {
  return isPromise(result) ? result : Promise.resolve(result);
};

class SelectorBase extends Provider {
  constructor(id, options, query) {
    super(id, options, query);
    this._dependencies = options._dependencies;
    this._resolvedDependencies = [];
    this._selector = options._selector;
    this._inProgressDependencies = new Set();
  }

  // Private methods

  _readAllDependenciesAndSelect() {
    let dependenciesResults;
    let dependencies;
    let dependenciesListeners;
    let hasToReadAgain = false;
    const inProgressListeners = [];

    const markToReadAgain = () => {
      hasToReadAgain = true;
    };

    const removeInProgressListenerFuncs = () => {
      inProgressListeners.forEach((removeListener) => removeListener());
      this._resolvedDependencies = Array.from(this._inProgressDependencies);
      this._inProgressDependencies.clear();
    };

    const cleanCache = () => {
      dependenciesListeners.forEach((removeListener) => removeListener());
      this.cleanCache();
    };

    const readDependency = (dependencyToRead, catchMethod) => {
      if (hasToReadAgain) {
        return Promise.resolve();
      }
      if (isArray(dependencyToRead)) {
        return Promise.all(dependencyToRead.map((dep) => readDependency(dep, catchMethod)));
      }
      if (isFunction(dependencyToRead)) {
        return readDependency(dependencyToRead(this._query, dependenciesResults), catchMethod);
      }
      if (isCatchedDependency(dependencyToRead)) {
        return readDependency(dependencyToRead.dependency, dependencyToRead.catch);
      }
      if (!isDataProvider(dependencyToRead)) {
        return resolveResult(dependencyToRead);
      }
      dependencies.push(dependencyToRead);
      if (!this._inProgressDependencies.has(dependencyToRead)) {
        this._inProgressDependencies.add(dependencyToRead);
        inProgressListeners.push(dependencyToRead.on(CLEAN_CACHE, markToReadAgain));
      }

      return dependencyToRead.read().catch((error) => {
        if (catchMethod) {
          const catchResult = catchMethod(error, this._query, dependenciesResults);
          if (isDependencyExpression(catchResult)) {
            return readDependency(catchResult);
          }
          return catchResult;
        }
        return Promise.reject(error);
      });
    };

    const readDependencies = (dependencyIndex = 0) => {
      if (hasToReadAgain) {
        return Promise.resolve();
      }
      if (dependencyIndex === 0) {
        dependenciesResults = [];
        dependencies = [];
      }
      return readDependency(this._dependencies[dependencyIndex]).then((dependencyResult) => {
        dependenciesResults.push(dependencyResult);
        if (dependencyIndex < this._dependencies.length - 1) {
          return readDependencies(dependencyIndex + 1);
        }
        const result = this._selector.apply(null, dependenciesResults.concat(this._query));
        return resolveResult(result);
      });
    };

    const addCleanListeners = () => {
      dependenciesListeners = dependencies.map((dependency) => {
        return dependency.once(CLEAN_CACHE, cleanCache);
      });
    };

    const readAndReturn = () => {
      return readDependencies()
        .then((result) => {
          if (isDependencyExpression(result)) {
            return readDependency(result);
          }
          return Promise.resolve(result);
        })
        .then((result) => {
          if (hasToReadAgain) {
            hasToReadAgain = false;
            return readAndReturn();
          }
          removeInProgressListenerFuncs();
          addCleanListeners();
          return Promise.resolve(result);
        })
        .catch((error) => {
          if (hasToReadAgain) {
            hasToReadAgain = false;
            return readAndReturn();
          }
          removeInProgressListenerFuncs();
          addCleanListeners();
          return Promise.reject(error);
        });
    };
    return readAndReturn();
  }

  _cleanCaches(dependencies) {
    dependencies.forEach((dependency) => {
      dependency.cleanDependenciesCache();
    });
  }

  // Overwrite Provider methods

  readMethod() {
    return this._readAllDependenciesAndSelect();
  }

  configMethod(options) {
    if (options.getChildQueryMethod) {
      this.getChildQueryMethod = (query) => {
        return options.getChildQueryMethod(query, this.queryValue);
      };
    }
  }

  cleanDependenciesCache() {
    if (this._inProgressDependencies.size > 0) {
      this._cleanCaches(Array.from(this._inProgressDependencies));
    } else {
      this._cleanCaches(this._resolvedDependencies);
    }
  }

  // Methods to be used for testing

  get dependencies() {
    return this._dependencies;
  }

  get selector() {
    return this._selector;
  }
}

// Expose a different interface for Selectors the first time, but children are built with the same interface than providers internally

class Selector extends SelectorBase {
  constructor(...args) {
    const lastIndex = args.length - 1;
    let selectorIndex = lastIndex;
    let options = {};

    if (!isFunction(args[lastIndex])) {
      selectorIndex = args.length - 2;
      options = args[lastIndex];
    }

    options._dependencies = args.slice(0, selectorIndex);
    options._selector = args[selectorIndex];
    super(options.id, options, undefined);
  }

  // Overwrite Provider methods

  createChildMethod(id, options, query) {
    return new SelectorBase(id, options, query);
  }
}

export default Selector;
