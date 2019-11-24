/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector error", () => {
  const fooError = new Error("foo-error");
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(fooError);
          }, 50);
        });
      }
    };
    testOrigin = new TestOrigin("foo-id");
    testSelector = new Selector(
      {
        source: testOrigin,
        query: query => query
      },
      result => result
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
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
          source: testOrigin,
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

  test.describe("when catch property is defined, and returns another source", () => {
    const ORIGIN_2_RETURNS = "foo-2";
    let TestOrigin2;
    let testOrigin2;

    test.beforeEach(() => {
      TestOrigin2 = class extends Origin {
        _read() {
          return Promise.resolve(ORIGIN_2_RETURNS);
        }
      };
      testOrigin2 = new TestOrigin2();
      testSelector = new Selector(
        {
          source: testOrigin,
          catch: () => {
            return testOrigin2;
          }
        },
        result => result
      );
    });

    test.it("should return null until read is dispatched", () => {
      test.expect(testSelector.read.error).to.be.null();
    });

    test.it(
      "should return the value returned by the source returned by catch function when read finish",
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
