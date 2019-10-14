import { ensureArray, mergeCloned, removeFalsy } from "./helpers";

export class SourcesHandler {
  constructor(baseTags) {
    this._baseTags = removeFalsy(ensureArray(baseTags));
    this._config = {};
    this._sources = new Set();
  }

  _add(source) {
    this._sources.add(source);
    source.config(this._config);
    return this;
  }

  config(options) {
    this._config = mergeCloned(this._config, options);
    this._sources.forEach(source => source.config(this._config));
  }

  clean() {
    this._sources.forEach(source => source.clean());
    return this;
  }

  // TODO, add onClean, onceClean, removeCleanListener, onChange and removeChangeListener

  call() {
    const args = Array.from(arguments);
    const methodName = args[0];
    args.shift();
    return this.elements.map(source => {
      if (source[methodName] instanceof Function) {
        return source[methodName].apply(source, args);
      } else {
        console.warn(`Source with id "${source._id}" has not method "${methodName}"`);
      }
    });
  }

  clear() {
    this._sources.clear();
    this._config = {};
    return this;
  }

  get size() {
    return this._sources.size;
  }

  get elements() {
    return Array.from(this._sources.values());
  }
}

export class Sources {
  constructor() {
    this._allSources = new SourcesHandler();
    this._tags = new Map();
    this._allSourcesById = new Map();
  }

  _createIdEmptyGroup(id) {
    const sourcesHandler = new SourcesHandler();
    this._allSourcesById.set(id, sourcesHandler);
    return sourcesHandler;
  }

  _createTagEmptyGroup(tag) {
    const sourcesHandler = new SourcesHandler(tag);
    this._tags.set(tag, sourcesHandler);
    return sourcesHandler;
  }

  getByTag(tag) {
    return this._tags.get(tag) || this._createTagEmptyGroup(tag);
  }

  getById(id) {
    return this._allSourcesById.get(id) || this._createIdEmptyGroup(id);
  }

  _add(source) {
    const idGroup = this._allSourcesById.get(source._id);
    if (idGroup) {
      if (idGroup.size > 0) {
        console.warn(`Duplicated Mercury source id "${source._id}"`);
        this._createIdEmptyGroup(source._id)._add(source);
      } else {
        idGroup._add(source);
      }
    } else {
      this._createIdEmptyGroup(source._id)._add(source);
    }
    this._allSources._add(source);
    source._tags.forEach(tag => {
      this.getByTag(tag)._add(source);
    });
    return this;
  }

  clear() {
    this._allSources.clear();
    this._allSourcesById.clear();
    this._tags.clear();
    return this._allSources.clear();
  }

  // Expose methods of all sources
  config(options) {
    return this._allSources.config(options);
  }

  clean() {
    return this._allSources.clean();
  }

  call() {
    return this._allSources.call.apply(this._allSources, arguments);
  }

  get size() {
    return this._allSources.size;
  }

  get elements() {
    return this._allSources.elements;
  }
}

export const sources = new Sources();
