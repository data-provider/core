const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");

test.describe("Origin error", () => {
  const fooError = new Error("foo-error");
  let sandbox;
  let TestOrigin;
  let testOrigin;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(fooError), 50;
          });
        });
      }
    };
    testOrigin = new TestOrigin("foo-id");
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("using getter", () => {
    test.it("should return null until read is dispatched", () => {
      test.expect(testOrigin.read.getters.error()).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testOrigin.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          return test.expect(testOrigin.read.getters.error()).to.equal(fooError);
        }
      );
    });
  });

  test.describe("without query", () => {
    test.it("should return null until read is dispatched", () => {
      test.expect(testOrigin.read.error).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testOrigin.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          return test.expect(testOrigin.read.error).to.equal(fooError);
        }
      );
    });

    test.it("should reject the promise with the error when read finish", () => {
      return testOrigin.read().then(
        () => {
          return test.assert.fail();
        },
        err => {
          return test.expect(err).to.equal(fooError);
        }
      );
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return null until read is dispatched", () => {
      test.expect(testOrigin.query(QUERY).read.error).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(testOrigin.query(QUERY).read.error).to.equal(fooError);
          }
        );
    });

    test.it("should reject the promise with the error when read finish", () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(
          () => {
            return test.assert.fail();
          },
          err => {
            return test.expect(err).to.equal(fooError);
          }
        );
    });
  });
});
