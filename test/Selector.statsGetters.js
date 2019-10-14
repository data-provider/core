const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector stats getters", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testSelector;
  let queriedSelector;
  let hasToReject;

  test.beforeEach(() => {
    hasToReject = false;
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read(query) {
        const cached = this._cache.get(query);
        if (cached) {
          return cached;
        }
        const resultPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            hasToReject ? reject(new Error()) : resolve();
          }, 50);
        });
        this._cache.set(query, resultPromise);
        return resultPromise;
      }
    };
    testOrigin = new TestOrigin("foo-id");
    testSelector = new Selector(testOrigin, result => result);
    queriedSelector = testSelector.query("foo");
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("without query", () => {
    test.describe("dispatch property", () => {
      test.it("should return 0 until read is dispatched", () => {
        test.expect(testSelector.read.getters.stats().dispatch).to.equal(0);
      });

      test.it("should return 1 when read is dispatched", () => {
        testSelector.read();
        test.expect(testSelector.read.getters.stats().dispatch).to.equal(1);
      });

      test.it(
        "should return 1 when read is dispatched many times and cache is not cleaned",
        () => {
          testSelector.read();
          testSelector.read();
          testSelector.read();
          testSelector.read();
          test.expect(testSelector.read.getters.stats().dispatch).to.equal(1);
        }
      );

      test.it(
        "should return 2 when read is dispatched many times and cache is cleaned once",
        () => {
          testSelector.read();
          testSelector.clean();
          testSelector.read();
          testSelector.read();
          testSelector.read();
          test.expect(testSelector.read.getters.stats().dispatch).to.equal(2);
        }
      );
    });

    test.describe("success property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(testSelector.read.getters.stats().success).to.equal(0);
      });

      test.it("should return 1 when read has finished", () => {
        return testSelector.read().then(() => {
          return test.expect(testSelector.read.getters.stats().success).to.equal(1);
        });
      });

      test.it("should return 4 when read has finished and it has been called 4 times", () => {
        return Promise.all([
          testSelector.read(),
          testSelector.read(),
          testSelector.read(),
          testSelector.read()
        ]).then(() => {
          return test.expect(testSelector.read.getters.stats().success).to.equal(4);
        });
      });
    });

    test.describe("error property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(testSelector.read.getters.stats().error).to.equal(0);
      });

      test.it("should return 1 when read has finished with an error", () => {
        hasToReject = true;
        return testSelector.read().then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(testSelector.read.getters.stats().error).to.equal(1);
          }
        );
      });

      test.it(
        "should return 4 when read has finished with error and it has been called 4 times",
        () => {
          hasToReject = true;
          return Promise.all([
            testSelector.read(),
            testSelector.read(),
            testSelector.read(),
            testSelector.read()
          ]).then(
            () => {
              return test.assert.fail();
            },
            () => {
              return test.expect(testSelector.read.getters.stats().error).to.equal(4);
            }
          );
        }
      );
    });
  });

  test.describe("with query", () => {
    test.describe("dispatch property", () => {
      test.it("should return 0 until read is dispatched", () => {
        test.expect(queriedSelector.read.getters.stats().dispatch).to.equal(0);
      });

      test.it("should return 1 when read is dispatched", () => {
        queriedSelector.read();
        test.expect(queriedSelector.read.getters.stats().dispatch).to.equal(1);
      });

      test.it(
        "should return 1 when read is dispatched many times and cache is not cleaned",
        () => {
          queriedSelector.read();
          queriedSelector.read();
          queriedSelector.read();
          queriedSelector.read();
          test.expect(queriedSelector.read.getters.stats().dispatch).to.equal(1);
        }
      );

      test.it(
        "should return 2 when read is dispatched many times and cache is cleaned once",
        () => {
          queriedSelector.read();
          queriedSelector.clean();
          queriedSelector.read();
          queriedSelector.read();
          queriedSelector.read();
          test.expect(queriedSelector.read.getters.stats().dispatch).to.equal(2);
        }
      );
    });

    test.describe("success property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(queriedSelector.read.getters.stats().success).to.equal(0);
      });

      test.it("should return 1 when read has finished", () => {
        return queriedSelector.read().then(() => {
          return test.expect(queriedSelector.read.getters.stats().success).to.equal(1);
        });
      });

      test.it("should return 4 when read has finished and it has been called 4 times", () => {
        return Promise.all([
          queriedSelector.read(),
          queriedSelector.read(),
          queriedSelector.read(),
          queriedSelector.read()
        ]).then(() => {
          return test.expect(queriedSelector.read.getters.stats().success).to.equal(4);
        });
      });
    });

    test.describe("error property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(queriedSelector.read.getters.stats().error).to.equal(0);
      });

      test.it("should return 1 when read has finished with an error", () => {
        hasToReject = true;
        return queriedSelector.read().then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(queriedSelector.read.getters.stats().error).to.equal(1);
          }
        );
      });

      test.it(
        "should return 4 when read has finished with error and it has been called 4 times",
        () => {
          hasToReject = true;
          return Promise.all([
            queriedSelector.read(),
            queriedSelector.read(),
            queriedSelector.read(),
            queriedSelector.read()
          ]).then(
            () => {
              return test.assert.fail();
            },
            () => {
              return test.expect(queriedSelector.read.getters.stats().error).to.equal(4);
            }
          );
        }
      );
    });
  });
});
