import { Provider } from "@data-provider/core";

class MockProvider extends Provider {
  readMethod() {
    var that = this;
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve([...that.options.data]);
      }, 1000);
    });
  }

  _getLastIndex() {
    if (!this.options.data.length) {
      return 1;
    }
    return this.options.data[this.options.data.length - 1].id + 1;
  }

  delete(id) {
    this.options.data = this.options.data.filter(function(item) {
      return item.id !== id;
    });
    this.cleanCache();
  }

  create(item) {
    this.options.data.push({
      id: this._getLastIndex(),
      ...item
    });
    this.cleanCache();
  }
}

export default MockProvider;
