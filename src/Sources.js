import { ensureArray, mergeCloned } from "./helpers";

export class SourcesHandler {
  constructor(source) {
    this._config = {};
    this._sources = new Set();
    this.add(source);
  }

  getByTags(tags) {
    const handler = new SourcesHandler();
    ensureArray(tags).forEach(tag => {
      this.elements.forEach(source => {
        if (source._tags.includes(tag)) {
          handler.add(source);
        }
      });
    });
    return handler;
  }

  getByTag(tag) {
    return this.getByTags(tag);
  }

  add(source) {
    if (source) {
      this._sources.add(source);
      source.config(this._config);
    }
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
    this._noSources = new SourcesHandler();
    this._tags = new Map();
    this._allSourcesById = new Map();
  }

  _createIdEmptyGroup(id) {
    const sourcesHandler = new SourcesHandler();
    this._allSourcesById.set(id, sourcesHandler);
    return sourcesHandler;
  }

  _createTagEmptyGroup(tag) {
    const sourcesHandler = new SourcesHandler();
    this._tags.set(tag, sourcesHandler);
    return sourcesHandler;
  }

  getByTags(tags) {
    if (!Array.isArray(tags)) {
      return this.getByTag(tags);
    }
    const handler = new SourcesHandler();
    tags.forEach(tag => {
      this.getByTag(tag).elements.forEach(source => {
        handler.add(source);
      });
    });
    return handler;
  }

  getByTag(tag) {
    if (Array.isArray(tag)) {
      return this.getByTags(tag);
    }
    return this._tags.get(tag) || this._createTagEmptyGroup(tag);
  }

  getById(id) {
    return this._allSourcesById.get(id) || this._createIdEmptyGroup(id);
  }

  add(source) {
    const idGroup = this._allSourcesById.get(source._id);
    if (idGroup) {
      if (idGroup.size > 0) {
        console.warn(`Duplicated Mercury source id "${source._id}"`);
        this._createIdEmptyGroup(source._id).add(source);
      } else {
        idGroup.add(source);
      }
    } else {
      this._createIdEmptyGroup(source._id).add(source);
    }
    this._allSources.add(source);
    source._tags.forEach(tag => {
      this.getByTag(tag).add(source);
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
