import { Provider } from "@data-provider/core";

import { debounce } from "helpers/debounce";

// Duplicate last item in data after 25 seconds in order to test polling

let addNewItem = false;
setTimeout(() => {
  addNewItem = true;
}, 25000);

const duplicateItem = (item) => {
  return Object.keys(item).reduce((newItem, itemKey) => {
    if (typeof item[itemKey] === "string") {
      newItem[itemKey] = `${item[itemKey]} - NEW ITEM`;
    } else {
      newItem[itemKey] = item[itemKey] + 1;
    }
    return newItem;
  }, {});
};

class MockProvider extends Provider {
  readMethod() {
    var that = this;
    return new Promise(function (resolve) {
      if (addNewItem) {
        addNewItem = false;
        that.options.data = that.options.data.concat([
          duplicateItem(that.options.data[that.options.data.length - 1]),
        ]);
      }
      setTimeout(function () {
        resolve([...that.options.data]);
      }, 1000);
    });
  }

  _cleanCache() {
    this.cleanCache();
  }

  cleanDependenciesCache() {
    console.log("Cleaning cache");
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
