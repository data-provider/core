/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider error", () => {
  const fooError = new Error("foo-error");
  let sandbox;
  let TestProvider;
  let testProvider;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestProvider = class extends Provider {
      _read() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(fooError);
          }, 50);
        });
      }
    };
    testProvider = new TestProvider("foo-id");
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("using getter", () => {
    test.it("should return null until read is dispatched", () => {
      test.expect(testProvider.read.getters.error()).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testProvider.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          return test.expect(testProvider.read.getters.error()).to.equal(fooError);
        }
      );
    });

    test.it("should return null when read cleanState is called", () => {
      return testProvider.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          testProvider.read.cleanState();
          return test.expect(testProvider.read.getters.error()).to.be.null();
        }
      );
    });

    test.it("should return null when cleanState is called", () => {
      return testProvider.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          testProvider.cleanState();
          return test.expect(testProvider.read.getters.error()).to.be.null();
        }
      );
    });
  });

  test.describe("without query", () => {
    test.it("should return null until read is dispatched", () => {
      test.expect(testProvider.read.error).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testProvider.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          return test.expect(testProvider.read.error).to.equal(fooError);
        }
      );
    });

    test.it("should reject the promise with the error when read finish", () => {
      return testProvider.read().then(
        () => {
          return test.assert.fail();
        },
        err => {
          return test.expect(err).to.equal(fooError);
        }
      );
    });

    test.it("should return null when read cleanAllState is called", () => {
      return testProvider.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          testProvider.read.cleanState();
          return test.expect(testProvider.read.error).to.be.null();
        }
      );
    });

    test.it("should return null when cleanAllState is called", () => {
      return testProvider.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          testProvider.cleanState();
          return test.expect(testProvider.read.error).to.be.null();
        }
      );
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return null until read is dispatched", () => {
      test.expect(testProvider.query(QUERY).read.error).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(testProvider.query(QUERY).read.error).to.equal(fooError);
          }
        );
    });

    test.it("should reject the promise with the error when read finish", () => {
      return testProvider
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

    test.it("should return null when read cleanState is called with query", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(
          () => {
            return test.assert.fail();
          },
          () => {
            testProvider.query(QUERY).read.cleanState();
            return test.expect(testProvider.query(QUERY).read.error).to.be.null();
          }
        );
    });

    test.it("should return null when cleanState is called with query", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(
          () => {
            return test.assert.fail();
          },
          () => {
            testProvider.query(QUERY).cleanState();
            return test.expect(testProvider.query(QUERY).read.error).to.be.null();
          }
        );
    });

    test.it("should return null when cleanState is called", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(
          () => {
            return test.assert.fail();
          },
          () => {
            testProvider.cleanState();
            return test.expect(testProvider.query(QUERY).read.error).to.be.null();
          }
        );
    });
  });
});
