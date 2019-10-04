const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin value", () => {
  const DEFAULT_VALUE = [];
  const VALUE = "foo-read-result";
  let sandbox;
  let TestOrigin;
  let testOrigin;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read() {
        return Promise.resolve(VALUE);
      }
    };
    testOrigin = new TestOrigin("foo-id", DEFAULT_VALUE);
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("using getter", () => {
    test.it("should return a clone of defaultValue until it load first time", () => {
      test.expect(testOrigin.read.getters.value()).to.deep.equal(DEFAULT_VALUE);
      test.expect(testOrigin.read.getters.value()).to.not.equal(DEFAULT_VALUE);
    });

    test.it("should change getter property when it has finished loading", () => {
      return testOrigin.read().then(() => {
        test.expect(testOrigin.read.getters.value()).to.equal(VALUE);
      });
    });
  });

  test.describe("Without query", () => {
    test.it("should return a clone of defaultValue until it load first time", () => {
      test.expect(testOrigin.read.value).to.deep.equal(DEFAULT_VALUE);
      test.expect(testOrigin.read.value).to.not.equal(DEFAULT_VALUE);
    });

    test.it("should change value property when it has finished loading", () => {
      return testOrigin.read().then(() => {
        return test.expect(testOrigin.read.value).to.equal(VALUE);
      });
    });

    test.it("should return value in read promise", () => {
      return testOrigin.read().then(value => {
        return test.expect(value).to.equal(VALUE);
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return a clone of defaultValue until it load first time", () => {
      test.expect(testOrigin.query(QUERY).read.value).to.deep.equal(DEFAULT_VALUE);
      test.expect(testOrigin.query(QUERY).read.value).to.not.equal(DEFAULT_VALUE);
    });

    test.it("should change value property when it has finished loading", () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(testOrigin.query(QUERY).read.value).to.equal(VALUE);
        });
    });

    test.it("should return value in read promise", () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(value => {
          return test.expect(value).to.equal(VALUE);
        });
    });
  });
});
