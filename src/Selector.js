/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { getAutomaticId, isFunction, isArray, once, isPromise, ensureArray } from "./helpers";
import Provider from "./Provider";

const isDataProvider = objectToCheck => {
  return (
    objectToCheck &&
    (objectToCheck instanceof Provider ||
      (objectToCheck.provider && objectToCheck.provider instanceof Provider))
  );
};

const areDataProviders = arrayToCheck => {
  return ensureArray(arrayToCheck).reduce((allAreDataProviders, arrayElement) => {
    if (!allAreDataProviders || !isDataProvider(arrayElement)) {
      return false;
    }
    return true;
  }, true);
};

class Selector extends Provider {
  constructor(id, options, query) {
    super(id, options, query);
    this._dependencies = options._dependencies;
    this._selector = options._selector;
  }

  _readAllDependenciesAndSelect() {
    const dependenciesResults = [];
    const dependencies = [];
    const cleanCache = once(() => {
      this.cleanCache();
    });

    const readDependency = dependencyToRead => {
      if (isArray(dependencyToRead)) {
        return Promise.all(dependencyToRead.map(readDependency));
      }
      let dependency;
      let hasToCatch;
      let hasToQuery;
      if (!isDataProvider(dependencyToRead)) {
        let provider = dependencyToRead.provider || dependencyToRead;
        if (isFunction(provider)) {
          provider = provider(this._query, dependenciesResults);
        }
        hasToQuery = !!dependencyToRead.query;
        hasToCatch = !!dependencyToRead.catch;
        dependency = hasToQuery
          ? provider.query(dependencyToRead.query(this._query, dependenciesResults))
          : provider;
      } else {
        dependency = dependencyToRead;
      }
      dependencies.push(dependency);
      return dependency.read().catch(error => {
        if (hasToCatch) {
          const catchResult = dependencyToRead.catch(error, this._query, dependenciesResults);
          if (areDataProviders(catchResult)) {
            return readDependency(catchResult);
          }
          return catchResult;
        }
        return Promise.reject(error);
      });
    };

    const readDependencies = (dependencyIndex = 0) => {
      return readDependency(this._dependencies[dependencyIndex]).then(dependencyResult => {
        dependenciesResults.push(dependencyResult);
        if (dependencyIndex < this._dependencies.length - 1) {
          return readDependencies(dependencyIndex + 1);
        }
        const result = this._selector.apply(null, dependenciesResults.concat(this._query));
        return isPromise(result) ? result : Promise.resolve(result);
      });
    };

    const addCleanQueryListeners = () => {
      dependencies.forEach(dependency => {
        dependency.on("cleanCache", cleanCache);
      });
    };

    return readDependencies()
      .then(result => {
        if (areDataProviders(result)) {
          return readDependency(result);
        }
        return Promise.resolve(result);
      })
      .then(result => {
        addCleanQueryListeners();
        return Promise.resolve(result);
      })
      .catch(error => {
        addCleanQueryListeners();
        return Promise.reject(error);
      });
  }

  readMethod() {
    return this._readAllDependenciesAndSelect();
  }
}

class SelectorInterface extends Selector {
  constructor() {
    const args = Array.from(arguments);
    const lastIndex = args.length - 1;
    let selectorIndex = lastIndex;
    let options = {};
    let id;

    if (!isFunction(args[lastIndex])) {
      selectorIndex = args.length - 2;
      options = args[lastIndex];
    }
    id = options.id || getAutomaticId();

    options._dependencies = args.slice(0, selectorIndex);
    options._selector = args[selectorIndex];
    super(id, options);
  }

  queryMethod(id, options, query) {
    return new Selector(id, options, query);
  }
}

export default SelectorInterface;
