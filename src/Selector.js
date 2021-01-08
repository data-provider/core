/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import {
  SELECTORS_TAG,
  CLEAN_CACHE,
  isFunction,
  isPromise,
  isArray,
  isPlainObject,
} from "./helpers";
import Provider from "./Provider";

import { isCatchedDependency, isDataProvider, resolveResult } from "./selectorHelpers";

class SelectorBase extends Provider {
  constructor(options, queryValue) {
    super(options, queryValue);
    this._dependencies = options._dependencies;
    this._dependenciesResolved = [];
    this._dependenciesInProgress = new Set();
  }

  // Private methods

  _readAllDependencies() {
    let dependenciesResults;
    let dependencies;
    let dependenciesListeners;
    let hasToReadAgain = false;
    let readAgainMaxTimeReached = false;
    const inProgressListeners = [];
    const readAgainTimeOut = setTimeout(() => {
      readAgainMaxTimeReached = true;
    }, this._options.readAgainMaxTime);

    if (this._readInProgress) {
      clearTimeout(readAgainTimeOut);
      return this._readInProgress;
    }

    const markToReadAgain = () => {
      if (!readAgainMaxTimeReached) {
        hasToReadAgain = true;
      }
    };

    const markToNotReadAgain = () => {
      hasToReadAgain = false;
    };

    const removeInProgressListenerFuncs = () => {
      inProgressListeners.forEach((removeListener) => removeListener());
      this._dependenciesResolved = Array.from(this._dependenciesInProgress);
      this._dependenciesInProgress.clear();
    };

    const cleanCache = () => {
      dependenciesListeners.forEach((removeListener) => removeListener());
      this.cleanCache({ force: true });
    };

    const readDependency = (dependencyToRead, catchMethod) => {
      const catchError = (promise) => {
        return promise.catch((error) => {
          if (catchMethod) {
            return readDependency(
              catchMethod.apply(catchMethod, [error, this.queryValue].concat(dependenciesResults))
            );
          }
          return Promise.reject(error);
        });
      };

      if (hasToReadAgain) {
        return Promise.resolve();
      }
      if (isCatchedDependency(dependencyToRead)) {
        return readDependency(dependencyToRead.dependency, dependencyToRead.catch);
      }
      if (isArray(dependencyToRead)) {
        return Promise.all(dependencyToRead.map((dep) => readDependency(dep, catchMethod)));
      }
      if (isFunction(dependencyToRead)) {
        return readDependency(
          dependencyToRead.apply(dependencyToRead, [this.queryValue].concat(dependenciesResults)),
          catchMethod
        );
      }
      if (isPromise(dependencyToRead)) {
        return catchError(
          dependencyToRead.then((result) => {
            return readDependency(result);
          })
        );
      }
      if (!isDataProvider(dependencyToRead)) {
        return resolveResult(dependencyToRead);
      }
      dependencies.push(dependencyToRead);
      if (!this._dependenciesInProgress.has(dependencyToRead)) {
        this._dependenciesInProgress.add(dependencyToRead);
        inProgressListeners.push(dependencyToRead.on(CLEAN_CACHE, markToReadAgain));
      }

      return catchError(dependencyToRead.read());
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
        return resolveResult(dependencyResult);
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
          if (hasToReadAgain) {
            markToNotReadAgain();
            return readAndReturn();
          }
          clearTimeout(readAgainTimeOut);
          removeInProgressListenerFuncs();
          addCleanListeners();
          return Promise.resolve(result);
        })
        .catch((error) => {
          if (hasToReadAgain) {
            markToNotReadAgain();
            return readAndReturn();
          }
          clearTimeout(readAgainTimeOut);
          removeInProgressListenerFuncs();
          addCleanListeners();
          return Promise.reject(error);
        });
    };

    this._readInProgress = readAndReturn()
      .then((result) => {
        this._readInProgress = null;
        return Promise.resolve(result);
      })
      .catch((error) => {
        this._readInProgress = null;
        return Promise.reject(error);
      });
    return this._readInProgress;
  }

  _cleanCaches(dependencies, options) {
    dependencies.forEach((dependency) => {
      if (
        !options.except ||
        (!options.except.includes(dependency) && !options.except.includes(dependency.parent))
      ) {
        dependency.cleanDependenciesCache(options);
      }
    });
  }

  // Overwrite Provider methods

  readMethod() {
    return this._readAllDependencies();
  }

  configMethod(options) {
    if (options.getChildQueryMethod) {
      this.getChildQueryMethod = (queryValue) => {
        return options.getChildQueryMethod(queryValue, this.queryValue);
      };
    }
  }

  _unthrottledCleanDependenciesCache(options = {}) {
    const dependenciesToClean = new Set(this._dependenciesResolved);
    this._dependenciesInProgress.forEach((dependency) => {
      dependenciesToClean.add(dependency);
    });
    this._cleanCaches(Array.from(dependenciesToClean), options);
  }

  // Define base tag

  get baseTags() {
    return SELECTORS_TAG;
  }

  // Methods to be used for testing

  get dependencies() {
    return this._dependencies;
  }

  get options() {
    return Object.keys(this._options).reduce((opts, key) => {
      // Remove Selector private options
      if (key.indexOf("_") !== 0) {
        opts[key] = this._options[key];
      }
      return opts;
    }, {});
  }

  createChildMethod(options, queryValue) {
    return new SelectorBase(options, queryValue);
  }
}

// Use different arguments for Selectors the first time, but children are built with the same interface than providers internally

class Selector extends SelectorBase {
  constructor(...args) {
    const lastIndex = args.length - 1;
    let dependenciesNumber = args.length;
    let options = {};

    if (isPlainObject(args[lastIndex])) {
      dependenciesNumber = dependenciesNumber - 1;
      options = { ...args[lastIndex] };
    }

    options._dependencies = args.slice(0, dependenciesNumber);
    super(options);
  }

  createChildMethod(options, queryValue) {
    return new SelectorBase(options, queryValue);
  }
}

export default Selector;
