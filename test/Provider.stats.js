/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider stats", () => {
  let sandbox;
  let TestProvider;
  let testProvider;
  let queriedProvider;
  let hasToReject;

  test.beforeEach(() => {
    hasToReject = false;
    sandbox = test.sinon.createSandbox();
    TestProvider = class extends Provider {
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
    testProvider = new TestProvider("foo-id");
    queriedProvider = testProvider.query("foo");
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("without query", () => {
    test.describe("dispatch property", () => {
      test.it("should return 0 until read is dispatched", () => {
        test.expect(testProvider.read.stats.dispatch).to.equal(0);
      });

      test.it("should return 1 when read is dispatched", () => {
        testProvider.read();
        test.expect(testProvider.read.stats.dispatch).to.equal(1);
      });

      test.it(
        "should return 1 when read is dispatched many times and cache is not cleaned",
        () => {
          testProvider.read();
          testProvider.read();
          testProvider.read();
          testProvider.read();
          test.expect(testProvider.read.stats.dispatch).to.equal(1);
        }
      );

      test.it(
        "should return 2 when read is dispatched many times and cache is cleaned once",
        () => {
          testProvider.read();
          testProvider.clean();
          testProvider.read();
          testProvider.read();
          testProvider.read();
          test.expect(testProvider.read.stats.dispatch).to.equal(2);
        }
      );
    });

    test.describe("success property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(testProvider.read.stats.success).to.equal(0);
      });

      test.it("should return 1 when read has finished", () => {
        return testProvider.read().then(() => {
          return test.expect(testProvider.read.stats.success).to.equal(1);
        });
      });

      test.it("should return 4 when read has finished and it has been called 4 times", () => {
        return Promise.all([
          testProvider.read(),
          testProvider.read(),
          testProvider.read(),
          testProvider.read()
        ]).then(() => {
          return test.expect(testProvider.read.stats.success).to.equal(4);
        });
      });
    });

    test.describe("cleanState property", () => {
      test.it("should return 0 until cleanState method has been called", () => {
        test.expect(testProvider.read.stats.cleanState).to.equal(0);
      });

      test.it("should return 1 when cleanState method has been called over read method", () => {
        testProvider.read.cleanState();
        test.expect(testProvider.read.stats.cleanState).to.equal(1);
      });

      test.it("should return 1 when cleanState method has been called", () => {
        testProvider.cleanState();
        test.expect(testProvider.read.stats.cleanState).to.equal(1);
      });

      test.it(
        "should return 4 when read has finished and it has been called 4 times over read method",
        () => {
          testProvider.read.cleanState();
          testProvider.read.cleanState();
          testProvider.read.cleanState();
          testProvider.read.cleanState();
          test.expect(testProvider.read.stats.cleanState).to.equal(4);
        }
      );

      test.it("should return 4 when read has finished and it has been called 4 times", () => {
        testProvider.cleanState();
        testProvider.cleanState();
        testProvider.cleanState();
        testProvider.cleanState();
        test.expect(testProvider.read.stats.cleanState).to.equal(4);
      });
    });

    test.describe("error property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(testProvider.read.stats.error).to.equal(0);
      });

      test.it("should return 1 when read has finished with an error", () => {
        hasToReject = true;
        return testProvider.read().then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(testProvider.read.stats.error).to.equal(1);
          }
        );
      });

      test.it(
        "should return 4 when read has finished with error and it has been called 4 times",
        () => {
          hasToReject = true;
          return Promise.all([
            testProvider.read(),
            testProvider.read(),
            testProvider.read(),
            testProvider.read()
          ]).then(
            () => {
              return test.assert.fail();
            },
            () => {
              return test.expect(testProvider.read.stats.error).to.equal(4);
            }
          );
        }
      );
    });
  });

  test.describe("with query", () => {
    test.describe("dispatch property", () => {
      test.it("should return 0 until read is dispatched", () => {
        test.expect(queriedProvider.read.stats.dispatch).to.equal(0);
      });

      test.it("should return 1 when read is dispatched", () => {
        queriedProvider.read();
        test.expect(queriedProvider.read.stats.dispatch).to.equal(1);
      });

      test.it(
        "should return 1 when read is dispatched many times and cache is not cleaned",
        () => {
          queriedProvider.read();
          queriedProvider.read();
          queriedProvider.read();
          queriedProvider.read();
          test.expect(queriedProvider.read.stats.dispatch).to.equal(1);
        }
      );

      test.it(
        "should return 2 when read is dispatched many times and cache is cleaned once",
        () => {
          queriedProvider.read();
          queriedProvider.clean();
          queriedProvider.read();
          queriedProvider.read();
          queriedProvider.read();
          test.expect(queriedProvider.read.stats.dispatch).to.equal(2);
        }
      );
    });

    test.describe("success property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(queriedProvider.read.stats.success).to.equal(0);
      });

      test.it("should return 1 when read has finished", () => {
        return queriedProvider.read().then(() => {
          return test.expect(queriedProvider.read.stats.success).to.equal(1);
        });
      });

      test.it("should return 4 when read has finished and it has been called 4 times", () => {
        return Promise.all([
          queriedProvider.read(),
          queriedProvider.read(),
          queriedProvider.read(),
          queriedProvider.read()
        ]).then(() => {
          return test.expect(queriedProvider.read.stats.success).to.equal(4);
        });
      });
    });

    test.describe("cleanState property", () => {
      test.it("should return 0 until cleanState method has been called", () => {
        test.expect(queriedProvider.read.stats.cleanState).to.equal(0);
      });

      test.it("should return 1 when cleanState method has been called", () => {
        queriedProvider.cleanState();
        test.expect(queriedProvider.read.stats.cleanState).to.equal(1);
      });

      test.it("should return 1 when cleanState method has been called over read method", () => {
        queriedProvider.read.cleanState();
        test.expect(queriedProvider.read.stats.cleanState).to.equal(1);
      });

      test.it(
        "should return 4 when read has finished and queried cleanState method has been called 4 times",
        () => {
          queriedProvider.cleanState();
          queriedProvider.cleanState();
          queriedProvider.cleanState();
          queriedProvider.cleanState();
          test.expect(queriedProvider.read.stats.cleanState).to.equal(4);
        }
      );

      test.it(
        "should return 4 when read has finished and queried cleanState method has been called 4 times over read method",
        () => {
          queriedProvider.read.cleanState();
          queriedProvider.read.cleanState();
          queriedProvider.read.cleanState();
          queriedProvider.read.cleanState();
          test.expect(queriedProvider.read.stats.cleanState).to.equal(4);
        }
      );

      test.it(
        "should return 4 when read has finished and cleanState method has been called 4 times",
        () => {
          testProvider.cleanState();
          testProvider.cleanState();
          testProvider.cleanState();
          testProvider.cleanState();
          test.expect(queriedProvider.read.stats.cleanState).to.equal(4);
        }
      );
    });

    test.describe("error property", () => {
      test.it("should return 0 until read method has finished", () => {
        test.expect(queriedProvider.read.stats.error).to.equal(0);
      });

      test.it("should return 1 when read has finished with an error", () => {
        hasToReject = true;
        return queriedProvider.read().then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(queriedProvider.read.stats.error).to.equal(1);
          }
        );
      });

      test.it(
        "should return 4 when read has finished with error and it has been called 4 times",
        () => {
          hasToReject = true;
          return Promise.all([
            queriedProvider.read(),
            queriedProvider.read(),
            queriedProvider.read(),
            queriedProvider.read()
          ]).then(
            () => {
              return test.assert.fail();
            },
            () => {
              return test.expect(queriedProvider.read.stats.error).to.equal(4);
            }
          );
        }
      );
    });
  });
});