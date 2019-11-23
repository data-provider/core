/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector cache", () => {
  const FOO_ORIGIN_VALUE = {
    foo: "foo"
  };
  const FOO_ORIGIN_2_VALUE = {
    foo2: "foo2"
  };
  const FOO_ORIGIN_3_VALUE = {
    foo3: "foo3"
  };
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let TestOrigin2;
  let testOrigin2;
  let TestOrigin3;
  let testOrigin3;
  let testOriginSelector;
  let testSelector;
  let spies;
  const selectorResult = (originResult, origin2Result, query) => {
    spies.testSelector(query);
    return {
      ...originResult,
      ...origin2Result
    };
  };
  const checkHasBeenCalledOnce = () => {
    return test.expect(spies.testSelector.callCount).to.equal(1);
  };

  const dispatchReadAndCheckHasBeenCalledOnce = () => {
    return testSelector.read().then(checkHasBeenCalledOnce);
  };

  const checkReadWithFailIsNotCached = () => {
    return testSelector.read().then(
      () => {
        return test.assert.fail();
      },
      () => {
        return testSelector.read().then(
          () => {
            return test.assert.fail();
          },
          () => {
            return test.expect(spies.testSelector.callCount).to.equal(2);
          }
        );
      }
    );
  };

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      testOriginRead: sandbox.spy(),
      testOrigin2Read: sandbox.spy(),
      testOrigin3Read: sandbox.spy(),
      testOrigin3Create: sandbox.spy(),
      testOrigin3Update: sandbox.spy(),
      testOrigin3Delete: sandbox.spy(),
      testOriginSelector: sandbox.spy(),
      testSelector: sandbox.spy()
    };
    TestOrigin = class extends Origin {
      _read(query) {
        spies.testOriginRead(query);
        return Promise.resolve(FOO_ORIGIN_VALUE);
      }
    };
    testOrigin = new TestOrigin();
    TestOrigin2 = class extends Origin {
      _read(query) {
        spies.testOrigin2Read(query);
        return Promise.resolve(FOO_ORIGIN_2_VALUE);
      }
    };
    testOrigin2 = new TestOrigin2();
    TestOrigin3 = class extends Origin {
      _read(query) {
        spies.testOrigin3Read(query);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
      _create(query, params) {
        spies.testOrigin3Create(query, params);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
      _update(query, params) {
        spies.testOrigin3Update(query, params);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
      _delete(query, params) {
        spies.testOrigin3Delete(query, params);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
    };
    testOrigin3 = new TestOrigin3();
    testOriginSelector = new Selector(
      {
        source: testOrigin3,
        query: query => query
      },
      (results, query) => {
        spies.testOriginSelector(query);
        return results;
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("when returns value", () => {
    test.beforeEach(() => {
      testSelector = new Selector(testOrigin, testOrigin2, selectorResult);
    });

    test.it(
      "should not execute selector function when read method is executed more than once",
      () => {
        return testSelector.read().then(dispatchReadAndCheckHasBeenCalledOnce);
      }
    );

    test.it(
      "should not execute selector function when read method is executed more than once in parallel",
      () => {
        return Promise.all([
          testSelector.read(),
          testSelector.read(),
          testSelector.read(),
          testSelector.read()
        ]).then(dispatchReadAndCheckHasBeenCalledOnce);
      }
    );

    test.it("should clean cache when one of the sources is cleaned", () => {
      return testSelector.read().then(() => {
        testOrigin.clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it("should clean cache when the another source is cleaned", () => {
      return testSelector.read().then(() => {
        testOrigin2.clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it("should not cache result when returns an error", () => {
      testSelector = new Selector(
        testOrigin,
        testOrigin2,
        (originResult, origin2Result, query) => {
          spies.testSelector(query);
          return Promise.reject(new Error());
        }
      );
      return checkReadWithFailIsNotCached();
    });
  });

  test.describe("when sources are queried", () => {
    const QUERY_1 = "foo-query-1";
    const QUERY_2 = "foo-query-2";

    test.beforeEach(() => {
      testSelector = new Selector(
        {
          source: testOrigin,
          query: () => QUERY_1
        },
        {
          source: testOrigin2,
          query: () => QUERY_2
        },
        selectorResult
      );
    });

    test.it(
      "should not execute selector function when read method is executed more than once",
      () => {
        return testSelector.read().then(dispatchReadAndCheckHasBeenCalledOnce);
      }
    );

    test.it(
      "should not execute selector function when read method is executed more than once in parallel",
      () => {
        return Promise.all([testSelector.read(), testSelector.read(), testSelector.read()]).then(
          dispatchReadAndCheckHasBeenCalledOnce
        );
      }
    );

    test.it("should clean cache when one of the queried sources is cleaned", () => {
      return testSelector.read().then(() => {
        testOrigin.query(QUERY_1).clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it("should not clean cache when one of the sources is cleaned with another query", () => {
      return testSelector.read().then(() => {
        testOrigin.query("foo-query-3").clean();
        return dispatchReadAndCheckHasBeenCalledOnce();
      });
    });

    test.it("should clean cache when the another source is cleaned", () => {
      return testSelector.read().then(() => {
        testOrigin2.query(QUERY_2).clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it("should not clean cache when the another source is cleaned with another query", () => {
      return testSelector.read().then(() => {
        testOrigin2.query("foo-query-3").clean();
        return dispatchReadAndCheckHasBeenCalledOnce();
      });
    });

    test.it("should not cache result when returns an error", () => {
      testSelector = new Selector(
        {
          source: testOrigin,
          query: () => QUERY_1
        },
        {
          source: testOrigin2,
          query: () => QUERY_2
        },
        (originResult, origin2Result, query) => {
          spies.testSelector(query);
          return Promise.reject(new Error());
        }
      );
      return checkReadWithFailIsNotCached();
    });
  });

  const testDynamicSelectors = (description, selectorCallback) => {
    test.describe(description, () => {
      test.beforeEach(() => {
        testSelector = new Selector(testOrigin, testOrigin2, selectorCallback);
      });

      test.describe("when no query is passed", () => {
        test.it("should clean cache when source cache is cleaned", () => {
          return testSelector.read().then(() => {
            testOriginSelector.clean();
            return testSelector.read().then(() => {
              return test.expect(spies.testSelector.callCount).to.equal(2);
            });
          });
        });
      });

      test.describe("when query is passed", () => {
        test.it("should clean cache when source cache is cleaned with same query", () => {
          const FOO_QUERY = "foo-query";
          return testSelector
            .query(FOO_QUERY)
            .read()
            .then(() => {
              testOriginSelector.query(FOO_QUERY).clean();
              return testSelector
                .query(FOO_QUERY)
                .read()
                .then(() => {
                  return test.expect(spies.testSelector.callCount).to.equal(2);
                });
            });
        });

        test.it("should not clean cache when source cache is cleaned with another query", () => {
          const FOO_QUERY = "foo-query";
          return testSelector
            .query(FOO_QUERY)
            .read()
            .then(() => {
              testOriginSelector.query("foo").clean();
              return testSelector
                .query(FOO_QUERY)
                .read()
                .then(checkHasBeenCalledOnce);
            });
        });
      });
    });
  };

  testDynamicSelectors("when returns another source", (originResult, origin2Result, query) => {
    spies.testSelector(query);
    return testOriginSelector.query(query);
  });

  testDynamicSelectors("when returns multiple sources", (originResult, origin2Result, query) => {
    spies.testSelector(query);
    return [testOriginSelector.query(query), testOriginSelector];
  });

  test.describe("cud methods", () => {
    const FOO_QUERY = "foo-query";
    test.beforeEach(() => {
      testSelector = new Selector(
        testOrigin,
        testOrigin2,
        (originResult, origin2Result, query) => {
          spies.testSelector(query);
          return testOrigin3.query(query);
        }
      );
    });

    const testMethod = methodName => {
      test.describe(`when executing ${methodName} method`, () => {
        test.describe("when no queried", () => {
          test.it("should clean cache after execution", () => {
            return testSelector.read().then(() => {
              return testSelector[methodName]().then(() => {
                return testSelector.read().then(() => {
                  return test.expect(spies.testSelector.callCount).to.equal(3);
                });
              });
            });
          });
        });

        test.describe("when queried", () => {
          test.it("should clean cache after execution", () => {
            return testSelector
              .query(FOO_QUERY)
              .read()
              .then(() => {
                return testSelector
                  .query(FOO_QUERY)
                  [methodName]()
                  .then(() => {
                    return testSelector
                      .query(FOO_QUERY)
                      .read()
                      .then(() => {
                        return test.expect(spies.testSelector.callCount).to.equal(3);
                      });
                  });
              });
          });
        });
      });
    };

    testMethod("create");
    testMethod("update");
    testMethod("delete");
  });
});
