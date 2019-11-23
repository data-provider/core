/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { once, isFunction } from "lodash";
import isPromise from "is-promise";

import { Provider } from "./Provider";
import {
  READ_METHOD,
  CREATE_METHOD,
  UPDATE_METHOD,
  DELETE_METHOD,
  seemsToBeSelectorOptions,
  areDataProviders
} from "./helpers";

const SOURCE_DEPRECATION_WARNING =
  '@data-provider deprecation warning: "source" property in selectors will be deprecated. Please use "provider" instead';

export class Selector extends Provider {
  constructor() {
    const args = Array.from(arguments);
    let lastIndex = args.length - 1;
    let defaultValue;
    let options;

    // Check if last argument is default value or options
    if (!isFunction(args[lastIndex])) {
      defaultValue = args[lastIndex];
      lastIndex = args.length - 2;
      if (seemsToBeSelectorOptions(defaultValue)) {
        options = defaultValue;
        defaultValue = defaultValue.defaultValue;
      } else {
        console.warn(
          "@data-provider: Please provide an object with 'defaultValue' property. Defining default value as last argument will be deprecated in next versions"
        );
      }
    }

    const providers = args.slice(0, lastIndex);

    const providersIds = [];

    const getTestObjects = providersOfLevel => {
      const queries = [];
      const catches = [];
      providersOfLevel.forEach(provider => {
        if (Array.isArray(provider)) {
          const childTestObjects = getTestObjects(provider);
          queries.push(childTestObjects.queries);
          catches.push(childTestObjects.catches);
        } else {
          // TODO, remove "source" compatibility
          if (provider.source) {
            console.warn(SOURCE_DEPRECATION_WARNING);
            provider.provider = provider.source;
          }
          const isProviderObject = !!provider.provider;
          providersIds.push(isProviderObject ? provider.provider._id : provider._id);
          if (isProviderObject && provider.query) {
            queries.push(provider.query);
          }
          if (isProviderObject && provider.catch) {
            catches.push(provider.catch);
          }
        }
      });
      return {
        queries,
        catches
      };
    };

    const testObjects = getTestObjects(providers);

    super(`select:${providersIds.join(":")}`, defaultValue, options);

    this._sources = providers; // TODO, deprecate
    this._providers = providers;
    this._resultsParser = args[lastIndex];
    this.test.queries = testObjects.queries;
    this.test.catches = testObjects.catches;
    this.test.selector = this._resultsParser;
  }

  _readAllProvidersAndDispatch(query, extraParams, methodToDispatch) {
    const providersResults = [];
    const providers = [];
    const cleanQuery = once(() => {
      this.clean(query);
    });

    const readProvider = providerToRead => {
      if (Array.isArray(providerToRead)) {
        return Promise.all(providerToRead.map(readProvider));
      }
      // TODO, remove source compatibility
      if (!!providerToRead.source) {
        console.warn(SOURCE_DEPRECATION_WARNING);
        providerToRead.provider = providerToRead.source;
      }
      const isQueried = !!providerToRead.provider;
      const hasToQuery = !!providerToRead.query;
      const hasToCatch = !!providerToRead.catch;
      const provider = isQueried
        ? hasToQuery
          ? providerToRead.provider.query(providerToRead.query(query, providersResults))
          : providerToRead.provider
        : providerToRead;
      providers.push(provider);
      return provider[READ_METHOD].dispatch().catch(error => {
        if (hasToCatch) {
          const catchResult = providerToRead.catch(error, query);
          if (areDataProviders(catchResult)) {
            providers.push(catchResult);
            return readProvider(catchResult);
          }
          return catchResult;
        }
        return Promise.reject(error);
      });
    };

    const readProviderIndex = providerIndex => {
      return readProvider(this._providers[providerIndex]).then(providerResult => {
        providersResults.push(providerResult);
        if (providerIndex < this._providers.length - 1) {
          return readProviderIndex(providerIndex + 1);
        }
        const result = this._resultsParser.apply(null, providersResults.concat(query));
        return isPromise(result) ? result : Promise.resolve(result);
      });
    };

    const addCleanQueryListeners = () => {
      providers.forEach(provider => {
        provider.onceClean(cleanQuery);
      });
    };

    return readProviderIndex(0)
      .then(result => {
        const selectorResult = result;
        const selectorResultIsProvider = areDataProviders(selectorResult);
        if (methodToDispatch !== READ_METHOD && !selectorResultIsProvider) {
          return Promise.reject(
            new Error("CUD methods can be used only when returning @data-provider instances")
          );
        }
        if (selectorResultIsProvider) {
          if (methodToDispatch === READ_METHOD) {
            return readProvider(selectorResult);
          }
          if (Array.isArray(selectorResult)) {
            return Promise.all(
              selectorResult.map(provider => provider[methodToDispatch].dispatch(extraParams))
            );
          }
          return selectorResult[methodToDispatch].dispatch(extraParams);
        }
        return Promise.resolve(selectorResult);
      })
      .then(result => {
        addCleanQueryListeners();
        return Promise.resolve(result);
      })
      .catch(error => {
        addCleanQueryListeners();
        this._cache.set(query, null);
        return Promise.reject(error);
      });
  }

  _read(query, extraParams) {
    const cached = this._cache.get(query);
    if (cached) {
      return cached;
    }
    const resultPromise = this._readAllProvidersAndDispatch(query, extraParams, READ_METHOD);
    this._cache.set(query, resultPromise);
    return resultPromise;
  }

  _cleanAfter(query, extraParams, method) {
    return this._readAllProvidersAndDispatch(query, extraParams, method).then(responseData => {
      this._clean(query);
      return Promise.resolve(responseData);
    });
  }

  _update(query, extraParams) {
    return this._cleanAfter(query, extraParams, UPDATE_METHOD);
  }

  _create(query, extraParams) {
    return this._cleanAfter(query, extraParams, CREATE_METHOD);
  }

  _delete(query, extraParams) {
    return this._cleanAfter(query, extraParams, DELETE_METHOD);
  }
}
