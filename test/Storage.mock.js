const sinon = require("sinon");

const Mock = class Mock {
  constructor(storageKey) {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      getItem: this._sandbox.stub().returns(""),
      setItem: this._sandbox.stub().returns("")
    };

    this._mock = {
      [storageKey]: this._stubs
    };
  }

  get stubs() {
    return this._stubs;
  }

  get mock() {
    return this._mock;
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
