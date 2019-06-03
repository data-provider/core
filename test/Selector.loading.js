const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector loading", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      }
    };
    testOrigin = new TestOrigin("foo-id");
    testSelector = new Selector(testOrigin, originResult => originResult);
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("using getter", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testSelector.read.getters.loading()).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testSelector.read();
      test.expect(testSelector.read.getters.loading()).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testSelector.read().then(() => {
        return test.expect(testSelector.read.getters.loading()).to.be.false();
      });
    });
  });

  test.describe("without query", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testSelector.read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testSelector.read();
      test.expect(testSelector.read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testSelector.read().then(() => {
        return test.expect(testSelector.read.loading).to.be.false();
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return false until read is dispatched", () => {
      test.expect(testSelector.query(QUERY).read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testSelector.query(QUERY).read();
      test.expect(testSelector.query(QUERY).read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testSelector
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(testSelector.query(QUERY).read.loading).to.be.false();
        });
    });
  });
});
