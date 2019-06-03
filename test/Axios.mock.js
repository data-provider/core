const sinon = require("sinon");

jest.mock("axios-retry");

const axios = require("axios");

const Mock = class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stub = this._sandbox.stub().resolves({
      data: {}
    });

    this._sandbox.stub(axios, "create").returns(this._stub);
  }

  get stubs() {
    return {
      instance: this._stub
    };
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
