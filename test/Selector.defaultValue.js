const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector defaultValue", () => {
  const DEFAULT_VALUE = "foo-default-value";
  const VALUE = "foo-value";
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read() {
        return Promise.resolve(VALUE);
      }
    };
    testOrigin = new TestOrigin();
    testSelector = new Selector(testOrigin, originResult => originResult, DEFAULT_VALUE);
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("when Origin has defaultValue defined", () => {
    test.it("should return defaultValue until real value is returned", () => {
      test.expect(testSelector.read.value).to.equal(DEFAULT_VALUE);
      return testSelector.read().then(() => {
        return test.expect(testSelector.read.value).to.equal(VALUE);
      });
    });
  });
});
