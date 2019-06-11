const sinon = require("sinon");

const PrismicJs = require("prismic-javascript");

const Mock = class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._apiQueryStub = this._sandbox.stub().resolves({});

    this._apiStub = this._sandbox.stub(PrismicJs, "api").resolves({
      query: this._apiQueryStub
    });
    this._predicatesAtStub = this._sandbox.stub(PrismicJs.Predicates, "at").returns("");
  }

  get stubs() {
    return {
      predicates: {
        at: this._predicatesAtStub
      },
      api: this._apiStub,
      apiQuery: this._apiQueryStub
    };
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
