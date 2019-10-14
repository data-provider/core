const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin stats getters", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let queriedOrigin;
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
    queriedOrigin = testOrigin.query("foo");
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("without query", () => {
    test.describe("dispatch property", () => {
      test.it("should return 0 until read is dispatched", () => {
        test.expect(testOrigin.read.getters.stats().dispatch).to.equal(0);
      });

      test.it("should return 1 when read is dispatched", () => {
        testOrigin.read();
        test.expect(testOrigin.read.getters.stats().dispatch).to.equal(1);
      });

      test.it(
        "should return 1 when read is dispatched many times and cache is not cleaned",
        () => {
          testOrigin.read();
          testOrigin.read();
          testOrigin.read();
          testOrigin.read();
          test.expect(testOrigin.read.getters.stats().dispatch).to.equal(1);
        }
      );

      test.it(
        "should return 2 when read is dispatched many times and cache is cleaned once",
        () => {
          testOrigin.read();
          testOrigin.clean();
          testOrigin.read();
          testOrigin.read();
          testOrigin.read();
          test.expect(testOrigin.read.getters.stats().dispatch).to.equal(2);
        }
      );
    });

    test.describe("success property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(testOrigin.read.getters.stats().success).to.equal(0);
      });

      test.it("should return 1 when read has finished", () => {
        return testOrigin.read().then(() => {
          return test.expect(testOrigin.read.getters.stats().success).to.equal(1);
        });
      });

      test.it("should return 4 when read has finished and it has been called 4 times", () => {
        return Promise.all([
          testOrigin.read(),
          testOrigin.read(),
          testOrigin.read(),
          testOrigin.read()
        ]).then(() => {
          return test.expect(testOrigin.read.getters.stats().success).to.equal(4);
        });
      });
    });

    test.describe("error property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(testOrigin.read.getters.stats().error).to.equal(0);
      });

      test.it("should return 1 when read has finished with an error", () => {
        hasToReject = true;
        return testOrigin.read().then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(testOrigin.read.getters.stats().error).to.equal(1);
          }
        );
      });

      test.it(
        "should return 4 when read has finished with error and it has been called 4 times",
        () => {
          hasToReject = true;
          return Promise.all([
            testOrigin.read(),
            testOrigin.read(),
            testOrigin.read(),
            testOrigin.read()
          ]).then(
            () => {
              return test.assert.fail();
            },
            () => {
              return test.expect(testOrigin.read.getters.stats().error).to.equal(4);
            }
          );
        }
      );
    });
  });

  test.describe("with query", () => {
    test.describe("dispatch property", () => {
      test.it("should return 0 until read is dispatched", () => {
        test.expect(queriedOrigin.read.getters.stats().dispatch).to.equal(0);
      });

      test.it("should return 1 when read is dispatched", () => {
        queriedOrigin.read();
        test.expect(queriedOrigin.read.getters.stats().dispatch).to.equal(1);
      });

      test.it(
        "should return 1 when read is dispatched many times and cache is not cleaned",
        () => {
          queriedOrigin.read();
          queriedOrigin.read();
          queriedOrigin.read();
          queriedOrigin.read();
          test.expect(queriedOrigin.read.getters.stats().dispatch).to.equal(1);
        }
      );

      test.it(
        "should return 2 when read is dispatched many times and cache is cleaned once",
        () => {
          queriedOrigin.read();
          queriedOrigin.clean();
          queriedOrigin.read();
          queriedOrigin.read();
          queriedOrigin.read();
          test.expect(queriedOrigin.read.getters.stats().dispatch).to.equal(2);
        }
      );
    });

    test.describe("success property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(queriedOrigin.read.getters.stats().success).to.equal(0);
      });

      test.it("should return 1 when read has finished", () => {
        return queriedOrigin.read().then(() => {
          return test.expect(queriedOrigin.read.getters.stats().success).to.equal(1);
        });
      });

      test.it("should return 4 when read has finished and it has been called 4 times", () => {
        return Promise.all([
          queriedOrigin.read(),
          queriedOrigin.read(),
          queriedOrigin.read(),
          queriedOrigin.read()
        ]).then(() => {
          return test.expect(queriedOrigin.read.getters.stats().success).to.equal(4);
        });
      });
    });

    test.describe("error property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(queriedOrigin.read.getters.stats().error).to.equal(0);
      });

      test.it("should return 1 when read has finished with an error", () => {
        hasToReject = true;
        return queriedOrigin.read().then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(queriedOrigin.read.getters.stats().error).to.equal(1);
          }
        );
      });

      test.it(
        "should return 4 when read has finished with error and it has been called 4 times",
        () => {
          hasToReject = true;
          return Promise.all([
            queriedOrigin.read(),
            queriedOrigin.read(),
            queriedOrigin.read(),
            queriedOrigin.read()
          ]).then(
            () => {
              return test.assert.fail();
            },
            () => {
              return test.expect(queriedOrigin.read.getters.stats().error).to.equal(4);
            }
          );
        }
      );
    });
  });
});
