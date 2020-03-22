import { Provider } from "@data-provider/core";

import { debounce } from "helpers/debounce";

class MockProvider extends Provider {
  readMethod() {
    var that = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve([...that.options.data]);
      }, 1000);
    });
  }

  _cleanCache() {
    this.cleanCache();
  }

  _debouncedCleanCache() {}

  configMethod(options) {
    if (options.cleanCacheDebounceTime > 0) {
      this._debouncedCleanCache = debounce(this._cleanCache, options.cleanCacheDebounceTime);
    } else {
      this._debouncedCleanCache = this._cleanCache;
    }
  }

  _getLastIndex() {
    if (!this.options.data.length) {
      return 1;
    }
    return this.options.data[this.options.data.length - 1].id + 1;
  }

  delete(id) {
    this.options.data = this.options.data.filter(function (item) {
      return item.id !== id;
    });
    this._debouncedCleanCache();
  }

  create(item) {
    this.options.data.push({
      id: this._getLastIndex(),
      ...item,
    });
    this._debouncedCleanCache();
  }
}

export default MockProvider;
