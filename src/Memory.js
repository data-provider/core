import { Origin } from "@xbyorange/mercury";
import { cloneDeep } from "lodash";

export class Memory extends Origin {
  constructor(value, id) {
    super(id || "memory", value);
    this._memory = cloneDeep(value || {});
    this.update(this._memory);
  }

  _read(key) {
    const cached = this._cache.get(key);
    if (cached) {
      return cached;
    }
    const promise = Promise.resolve(key ? this._memory[key] : this._memory);
    this._cache.set(key, promise);
    return promise;
  }

  _update(query, value) {
    const data = cloneDeep(value);
    if (query) {
      this._memory[query] = data;
    } else {
      this._memory = data;
    }
    this._clean(query);
    return Promise.resolve();
  }

  _create(query, value) {
    this._update(query, value);
    this._clean();
    return Promise.resolve();
  }

  _delete(query) {
    if (query) {
      delete this._memory[query];
    } else {
      this._memory = {};
    }
    this._clean();
    return Promise.resolve();
  }
}
