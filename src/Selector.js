/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { isFunction, isArray, isPromise, ensureArray, message } from "./helpers";
import Provider from "./Provider";

const isDataProvider = objectToCheck => {
  return objectToCheck && objectToCheck instanceof Provider;
};

const isDataProviderExpression = objectToCheck => {
  if (!objectToCheck) {
    return false;
  }
  return (
    isDataProvider(objectToCheck) ||
    isFunction(objectToCheck) ||
    isDataProvider(objectToCheck.provider) ||
    isFunction(objectToCheck.provider)
  );
};

const areDataProvidersExpressions = arrayToCheck => {
  return ensureArray(arrayToCheck).reduce((allAreDataProviders, arrayElement) => {
    if (!allAreDataProviders || !isDataProviderExpression(arrayElement)) {
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
    let removeListenersFuncs;
    const cleanCache = () => {
      removeListenersFuncs.forEach(removeListener => removeListener());
      this.cleanCache();
    };

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
        if (!isDataProvider(provider)) {
          throw new Error(
            message(
              "Only data providers can be used as dependencies in Selectors. If you are returning a function, ensure it also returns a valid data provider"
            )
          );
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
          if (areDataProvidersExpressions(catchResult)) {
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

    const addCleanListeners = () => {
      removeListenersFuncs = dependencies.map(dependency => {
        return dependency.once("cleanCache", cleanCache);
      });
    };

    return readDependencies()
      .then(result => {
        if (areDataProvidersExpressions(result)) {
          return readDependency(result);
        }
        return Promise.resolve(result);
      })
      .then(result => {
        addCleanListeners();
        return Promise.resolve(result);
      })
      .catch(error => {
        addCleanListeners();
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

    if (!isFunction(args[lastIndex])) {
      selectorIndex = args.length - 2;
      options = args[lastIndex];
    }

    options._dependencies = args.slice(0, selectorIndex);
    options._selector = args[selectorIndex];
    super(options.id, options);
  }

  createChild(id, options, query) {
    return new Selector(id, options, query);
  }
}

export default SelectorInterface;
