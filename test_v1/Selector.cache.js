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
  let TestProvider;
  let testProvider;
  let TestProvider2;
  let testProvider2;
  let TestProvider3;
  let testProvider3;
  let testProviderSelector;
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
      testProviderRead: sandbox.spy(),
      testProvider2Read: sandbox.spy(),
      testProvider3Read: sandbox.spy(),
      testProvider3Create: sandbox.spy(),
      testProvider3Update: sandbox.spy(),
      testProvider3Delete: sandbox.spy(),
      testProviderSelector: sandbox.spy(),
      testSelector: sandbox.spy()
    };
    TestProvider = class extends Provider {
      _read(query) {
        spies.testProviderRead(query);
        return Promise.resolve(FOO_ORIGIN_VALUE);
      }
    };
    testProvider = new TestProvider();
    TestProvider2 = class extends Provider {
      _read(query) {
        spies.testProvider2Read(query);
        return Promise.resolve(FOO_ORIGIN_2_VALUE);
      }
    };
    testProvider2 = new TestProvider2();
    TestProvider3 = class extends Provider {
      _read(query) {
        spies.testProvider3Read(query);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
      _create(query, params) {
        spies.testProvider3Create(query, params);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
      _update(query, params) {
        spies.testProvider3Update(query, params);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
      _delete(query, params) {
        spies.testProvider3Delete(query, params);
        return Promise.resolve(FOO_ORIGIN_3_VALUE);
      }
    };
    testProvider3 = new TestProvider3();
    testProviderSelector = new Selector(
      {
        provider: testProvider3,
        query: query => query
      },
      (results, query) => {
        spies.testProviderSelector(query);
        return results;
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("when returns value", () => {
    test.beforeEach(() => {
      testSelector = new Selector(testProvider, testProvider2, selectorResult);
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

    test.it("should clean cache when one of the providers is cleaned", () => {
      return testSelector.read().then(() => {
        testProvider.clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it("should clean cache when the another provider is cleaned", () => {
      return testSelector.read().then(() => {
        testProvider2.clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it("should not cache result when returns an error", () => {
      testSelector = new Selector(
        testProvider,
        testProvider2,
        (originResult, origin2Result, query) => {
          spies.testSelector(query);
          return Promise.reject(new Error());
        }
      );
      return checkReadWithFailIsNotCached();
    });
  });

  test.describe("when providers are queried", () => {
    const QUERY_1 = "foo-query-1";
    const QUERY_2 = "foo-query-2";

    test.beforeEach(() => {
      testSelector = new Selector(
        {
          provider: testProvider,
          query: () => QUERY_1
        },
        {
          provider: testProvider2,
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

    test.it("should clean cache when one of the queried providers is cleaned", () => {
      return testSelector.read().then(() => {
        testProvider.query(QUERY_1).clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it(
      "should not clean cache when one of the providers is cleaned with another query",
      () => {
        return testSelector.read().then(() => {
          testProvider.query("foo-query-3").clean();
          return dispatchReadAndCheckHasBeenCalledOnce();
        });
      }
    );

    test.it("should clean cache when the another provider is cleaned", () => {
      return testSelector.read().then(() => {
        testProvider2.query(QUERY_2).clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelector.callCount).to.equal(2);
        });
      });
    });

    test.it(
      "should not clean cache when the another provider is cleaned with another query",
      () => {
        return testSelector.read().then(() => {
          testProvider2.query("foo-query-3").clean();
          return dispatchReadAndCheckHasBeenCalledOnce();
        });
      }
    );

    test.it("should not cache result when returns an error", () => {
      testSelector = new Selector(
        {
          provider: testProvider,
          query: () => QUERY_1
        },
        {
          provider: testProvider2,
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
        testSelector = new Selector(testProvider, testProvider2, selectorCallback);
      });

      test.describe("when no query is passed", () => {
        test.it("should clean cache when provider cache is cleaned", () => {
          return testSelector.read().then(() => {
            testProviderSelector.clean();
            return testSelector.read().then(() => {
              return test.expect(spies.testSelector.callCount).to.equal(2);
            });
          });
        });
      });

      test.describe("when query is passed", () => {
        test.it("should clean cache when provider cache is cleaned with same query", () => {
          const FOO_QUERY = "foo-query";
          return testSelector
            .query(FOO_QUERY)
            .read()
            .then(() => {
              testProviderSelector.query(FOO_QUERY).clean();
              return testSelector
                .query(FOO_QUERY)
                .read()
                .then(() => {
                  return test.expect(spies.testSelector.callCount).to.equal(2);
                });
            });
        });

        test.it("should not clean cache when provider cache is cleaned with another query", () => {
          const FOO_QUERY = "foo-query";
          return testSelector
            .query(FOO_QUERY)
            .read()
            .then(() => {
              testProviderSelector.query("foo").clean();
              return testSelector
                .query(FOO_QUERY)
                .read()
                .then(checkHasBeenCalledOnce);
            });
        });
      });
    });
  };

  testDynamicSelectors("when returns another provider", (originResult, origin2Result, query) => {
    spies.testSelector(query);
    return testProviderSelector.query(query);
  });

  testDynamicSelectors("when returns multiple providers", (originResult, origin2Result, query) => {
    spies.testSelector(query);
    return [testProviderSelector.query(query), testProviderSelector];
  });

  test.describe("cud methods", () => {
    const FOO_QUERY = "foo-query";
    test.beforeEach(() => {
      testSelector = new Selector(
        testProvider,
        testProvider2,
        (originResult, origin2Result, query) => {
          spies.testSelector(query);
          return testProvider3.query(query);
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
