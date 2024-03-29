import { Provider } from "@data-provider/core";

export const debounce = function (func, wait = 100) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

class MockProvider extends Provider {
  readMethod() {
    let that = this;
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (!that._errorToThrow) {
          resolve([...that.options.data]);
        } else {
          reject(that._errorToThrow);
        }
      }, 300);
    });
  }

  _cleanCache() {
    this.cleanCache();
  }

  _debouncedCleanCache() {
    // do nothing
  }

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

  set error(error) {
    this._errorToThrow = error;
  }
}

export default MockProvider;
