export class SourcesHandler {
  constructor(source) {
    this._sources = new Set();
    this.add(source);
  }

  add(source) {
    if (source) {
      this._sources.add(source);
    }
    return this;
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
    this._sources.forEach(source => {
      if (source[methodName] instanceof Function) {
        source[methodName].apply(source, args);
      } else {
        console.warn(`Source with id "${source._id}" has not method "${methodName}"`);
      }
    });
    return this;
  }

  clear() {
    this._sources.clear();
    return this;
  }

  get size() {
    return this._sources.size;
  }

  get elements() {
    return this._sources.values();
  }
}

export class Sources {
  constructor() {
    this._allSources = new SourcesHandler();
    this._noSources = new SourcesHandler();
    this._tags = new Map();
    this._allSourcesById = new Map();
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
      return this.getByTag(tag);
    }
    return this._tags.get(tag) || this._noSources;
  }

  getById(id) {
    return this._allSourcesById.get(id) || this._noSources;
  }

  add(source) {
    if (this._allSourcesById.get(source._id)) {
      console.warn(`Duplicated Mercury source id "${source._id}"`);
    }
    this._allSourcesById.set(source._id, new SourcesHandler(source));
    this._allSources.add(source);
    source._tags.forEach(tag => {
      if (!this._tags.has(tag)) {
        this._tags.set(tag, new SourcesHandler(source));
      } else {
        this.getByTag(tag).add(source);
      }
    });
    return this;
  }

  clear() {
    this._allSourcesById.clear();
    this._tags.clear();
    return this._allSources.clear();
  }

  // Expose methods of all sources
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
