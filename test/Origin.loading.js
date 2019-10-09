const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin loading", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;

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
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("using getter", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testOrigin.read.getters.loading()).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testOrigin.read();
      test.expect(testOrigin.read.getters.loading()).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testOrigin.read().then(() => {
        return test.expect(testOrigin.read.getters.loading()).to.be.false();
      });
    });
  });

  test.describe("without query", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testOrigin.read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testOrigin.read();
      test.expect(testOrigin.read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testOrigin.read().then(() => {
        return test.expect(testOrigin.read.loading).to.be.false();
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return false until read is dispatched", () => {
      test.expect(testOrigin.query(QUERY).read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testOrigin.query(QUERY).read();
      test.expect(testOrigin.query(QUERY).read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(testOrigin.query(QUERY).read.loading).to.be.false();
        });
    });
  });
});
