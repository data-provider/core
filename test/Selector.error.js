/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");
const { Selector } = require("../src/Selector");

test.describe("Selector error", () => {
  const fooError = new Error("foo-error");
  let sandbox;
  let TestProvider;
  let testProvider;
  let testSelector;

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
    testSelector = new Selector(
      {
        provider: testProvider,
        query: query => query
      },
      result => result
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("using getter", () => {
    test.it("should return null until read is dispatched", () => {
      test.expect(testSelector.read.getters.error()).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testSelector.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          return test.expect(testSelector.read.getters.error()).to.equal(fooError);
        }
      );
    });
  });

  test.describe("without query", () => {
    test.it("should return null until read is dispatched", () => {
      test.expect(testSelector.read.error).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testSelector.read().then(
        () => {
          return test.assert.fail();
        },
        () => {
          return test.expect(testSelector.read.error).to.equal(fooError);
        }
      );
    });

    test.it("should reject the promise with the error when read finish", () => {
      return testSelector.read().then(
        () => {
          return test.assert.fail();
        },
        err => {
          return test.expect(err).to.equal(fooError);
        }
      );
    });
  });

  test.describe("when catch property is defined", () => {
    const CATCH_RETURNS = "foo";
    test.beforeEach(() => {
      testSelector = new Selector(
        {
          provider: testProvider,
          catch: () => {
            return Promise.resolve(CATCH_RETURNS);
          }
        },
        result => result
      );
    });

    test.it("should return null until read is dispatched", () => {
      test.expect(testSelector.read.error).to.be.null();
    });

    test.it("should return the value returned by the catch function when read finish", () => {
      return testSelector.read().then(result => {
        return test.expect(result).to.equal(CATCH_RETURNS);
      });
    });
  });

  test.describe("when catch property is defined, and returns another provider", () => {
    const ORIGIN_2_RETURNS = "foo-2";
    let TestProvider2;
    let testProvider2;

    test.beforeEach(() => {
      TestProvider2 = class extends Provider {
        _read() {
          return Promise.resolve(ORIGIN_2_RETURNS);
        }
      };
      testProvider2 = new TestProvider2();
      testSelector = new Selector(
        {
          provider: testProvider,
          catch: () => {
            return testProvider2;
          }
        },
        result => result
      );
    });

    test.it("should return null until read is dispatched", () => {
      test.expect(testSelector.read.error).to.be.null();
    });

    test.it(
      "should return the value returned by the provider returned by catch function when read finish",
      () => {
        return testSelector.read().then(result => {
          return test.expect(result).to.equal(ORIGIN_2_RETURNS);
        });
      }
    );
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return null until read is dispatched", () => {
      test.expect(testSelector.query(QUERY).read.error).to.be.null();
    });

    test.it("should return error when read finish", () => {
      return testSelector
        .query(QUERY)
        .read()
        .then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(testSelector.query(QUERY).read.error).to.equal(fooError);
          }
        );
    });

    test.it("should reject the promise with the error when read finish", () => {
      return testSelector
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
