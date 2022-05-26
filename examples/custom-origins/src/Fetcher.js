const { Provider } = require("@data-provider/core");
const crossFetch = require("cross-fetch");

class Fetcher extends Provider {
  configMethod(options) {
    this._baseUrl = options.baseUrl;
  }

  readMethod() {
    return crossFetch(`${this._baseUrl}${this.queryValue.url || ""}`).then((res) => {
      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
      return res.json();
    });
  }

  // This method has duplicated code intentionally due to the simplication of the docs examples
  update(data) {
    return crossFetch(`${this._baseUrl}${this.queryValue.url || ""}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
      this.cleanCache();
      return res.json();
    });
  }
}

module.exports = Fetcher;
