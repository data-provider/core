import { once, isFunction } from "lodash";
import isPromise from "is-promise";

import { Origin } from "./Origin";
import {
  READ_METHOD,
  CREATE_METHOD,
  UPDATE_METHOD,
  DELETE_METHOD,
  seemsToBeSelectorOptions,
  areSources
} from "./helpers";

export class Selector extends Origin {
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
          "Please provide an object with 'defaultValue' property. Defining default value as last argument will be deprecated in next versions"
        );
      }
    }

    const sources = args.slice(0, lastIndex);

    const sourceIds = [];

    const getTestObjects = sourcesOfLevel => {
      const queries = [];
      const catches = [];
      sourcesOfLevel.forEach(source => {
        if (Array.isArray(source)) {
          const testObjects = getTestObjects(source);
          queries.push(testObjects.queries);
          catches.push(testObjects.catches);
        } else {
          const isSourceObject = !!source.source;
          sourceIds.push(isSourceObject ? source.source._id : source._id);
          if (isSourceObject && source.query) {
            queries.push(source.query);
          }
          if (isSourceObject && source.catch) {
            catches.push(source.catch);
          }
        }
      });
      return {
        queries,
        catches
      };
    };

    const testObjects = getTestObjects(sources);

    super(`select:${sourceIds.join(":")}`, defaultValue, options);

    this._sources = sources;
    this._resultsParser = args[lastIndex];
    this.test.queries = testObjects.queries;
    this.test.catches = testObjects.catches;
    this.test.selector = this._resultsParser;
  }

  _readAllSourcesAndDispatch(query, extraParams, methodToDispatch) {
    const sourcesResults = [];
    const sources = [];
    const cleanQuery = once(() => {
      this.clean(query);
    });

    const readSource = sourceToRead => {
      if (Array.isArray(sourceToRead)) {
        return Promise.all(sourceToRead.map(readSource));
      }
      const isQueried = !!sourceToRead.source;
      const hasToQuery = !!sourceToRead.query;
      const hasToCatch = !!sourceToRead.catch;
      const source = isQueried
        ? hasToQuery
          ? sourceToRead.source.query(sourceToRead.query(query, sourcesResults))
          : sourceToRead.source
        : sourceToRead;
      sources.push(source);
      return source[READ_METHOD].dispatch().catch(error => {
        if (hasToCatch) {
          const catchResult = sourceToRead.catch(error, query);
          if (areSources(catchResult)) {
            sources.push(catchResult);
            return readSource(catchResult);
          }
          return catchResult;
        }
        return Promise.reject(error);
      });
    };

    const readSourceIndex = sourceIndex => {
      return readSource(this._sources[sourceIndex]).then(sourceResult => {
        sourcesResults.push(sourceResult);
        if (sourceIndex < this._sources.length - 1) {
          return readSourceIndex(sourceIndex + 1);
        }
        const result = this._resultsParser.apply(null, sourcesResults.concat(query));
        return isPromise(result) ? result : Promise.resolve(result);
      });
    };

    const addCleanQueryListeners = () => {
      sources.forEach(source => {
        source.onceClean(cleanQuery);
      });
    };

    return readSourceIndex(0)
      .then(result => {
        const selectorResult = result;
        const selectorResultIsSource = areSources(selectorResult);
        if (methodToDispatch !== READ_METHOD && !selectorResultIsSource) {
          return Promise.reject(new Error("CUD methods can be used only when returning sources"));
        }
        if (selectorResultIsSource) {
          if (methodToDispatch === READ_METHOD) {
            return readSource(selectorResult);
          }
          if (Array.isArray(selectorResult)) {
            return Promise.all(
              selectorResult.map(source => source[methodToDispatch].dispatch(extraParams))
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
    const resultPromise = this._readAllSourcesAndDispatch(query, extraParams, READ_METHOD);
    this._cache.set(query, resultPromise);
    return resultPromise;
  }

  _cleanAfter(query, extraParams, method) {
    return this._readAllSourcesAndDispatch(query, extraParams, method).then(responseData => {
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
