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

test.describe("Selector using parallel providers", () => {
  const FORCE_ERROR = "force-error";
  const FOO_ORIGIN_VALUE = {
    foo: "foo"
  };
  const FOO_ORIGIN_2_VALUE = {
    foo2: "foo2"
  };
  const FOO_ORIGIN_3_VALUE = {
    foo3: "foo3"
  };
  const FOO_ORIGIN_4_VALUE = {
    foo4: "foo4"
  };
  const DEFAULT_VALUE = { foo: "default" };
  let sandbox;
  let TestProvider;
  let testProvider;
  let TestProvider2;
  let testProvider2;
  let TestProvider3;
  let testProvider3;
  let TestProvider4;
  let testProvider4;
  let testProviderSelector;
  let testSelector;
  let spies;
  const testSelectorCalledOnce = () => {
    return testSelector.read().then(() => {
      return test.expect(spies.testSelectorRead).to.have.been.calledOnce();
    });
  };
  const selectorMethod = (parallelResults, origin3Results) => {
    spies.testSelectorRead();
    return {
      parallel: parallelResults,
      single: origin3Results
    };
  };
  const queryAndReadTwiceAndCheckCalledOnce = () => {
    const QUERY = "foo-query";
    return testSelector
      .query(QUERY)
      .read()
      .then(() => {
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return test.expect(spies.testSelectorRead).to.have.been.calledOnce();
          });
      });
  };
  const queryAndCleanAndCheckCalledTwice = () => {
    const QUERY = "foo-query";
    return testSelector
      .query(QUERY)
      .read()
      .then(() => {
        testProvider.query(QUERY).clean();
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return test.expect(spies.testSelectorRead).to.have.been.calledTwice();
          });
      });
  };

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      testProviderRead: sandbox.spy(),
      testProvider2Read: sandbox.spy(),
      testProvider3Read: sandbox.spy(),
      testProvider4Read: sandbox.spy(),
      testProviderSelectorRead: sandbox.spy(),
      testSelectorRead: sandbox.spy()
    };
    TestProvider = class extends Provider {
      _read(query) {
        spies.testProviderRead(query);
        if (query === FORCE_ERROR) {
          return Promise.reject(new Error(FORCE_ERROR));
        }
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(FOO_ORIGIN_VALUE);
          }, 100);
        });
      }
    };
    testProvider = new TestProvider();
    TestProvider2 = class extends Provider {
      _read(query) {
        spies.testProvider2Read(query);
        if (query === FORCE_ERROR) {
          return Promise.reject(new Error(FORCE_ERROR));
        }
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(FOO_ORIGIN_2_VALUE);
          }, 100);
        });
      }
    };
    testProvider2 = new TestProvider2();
    TestProvider3 = class extends Provider {
      _read(query) {
        spies.testProvider3Read(query);
        if (query === FORCE_ERROR) {
          return Promise.reject(new Error(FORCE_ERROR));
        }
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(FOO_ORIGIN_3_VALUE);
          }, 100);
        });
      }
    };
    testProvider3 = new TestProvider3();
    TestProvider4 = class extends Provider {
      _read(query) {
        spies.testProvider4Read(query);
        if (query === FORCE_ERROR) {
          return Promise.reject(new Error(FORCE_ERROR));
        }
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(FOO_ORIGIN_4_VALUE);
          }, 100);
        });
      }
    };
    testProvider4 = new TestProvider4();
    testProviderSelector = new Selector(
      {
        provider: testProvider3,
        query: query => query
      },
      (testProviderResult, query) => {
        spies.testProviderSelectorRead(query);
        if (query === FORCE_ERROR) {
          return Promise.reject(new Error(FORCE_ERROR));
        }
        return testProvider4.query(query);
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("with parallel providers", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [testProvider, testProvider2],
        originResults => {
          spies.testSelectorRead();
          return originResults;
        },
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.describe("value", () => {
      test.it("should return value returned by parser function", () => {
        return testSelector.read().then(value => {
          return test.expect(value).to.deep.equal([FOO_ORIGIN_VALUE, FOO_ORIGIN_2_VALUE]);
        });
      });
    });

    test.describe("execution order", () => {
      test.it("should call to both providers in parallel", () => {
        const read = testSelector.read();
        return Promise.all([
          test.expect(spies.testProviderRead).to.have.been.called(),
          test.expect(spies.testProvider2Read).to.have.been.called(),
          read
        ]);
      });
    });

    test.describe("when provider cache is cleaned", () => {
      test.it("should clean cache", () => {
        return testSelector.read().then(() => {
          testProvider2.clean();
          return testSelector.read().then(() => {
            return test.expect(spies.testSelectorRead).to.have.been.calledTwice();
          });
        });
      });
    });
  });

  test.describe("with parallel providers catching error", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [
          {
            provider: testProvider,
            catch: () => {
              return Promise.resolve("error");
            },
            query: () => FORCE_ERROR
          },
          testProvider2
        ],
        originResults => {
          spies.testSelectorRead();
          return originResults;
        },
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("should return value returned by catch", () => {
      return testSelector.read().then(value => {
        return test.expect(value).to.deep.equal(["error", FOO_ORIGIN_2_VALUE]);
      });
    });
  });

  test.describe("with parallel providers catching error and returning another provider", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [
          {
            provider: testProvider,
            catch: (error, query) => {
              const queryObject = query && {
                receivedQuery: query
              };
              return testProvider3.query(queryObject);
            },
            query: query => query || FORCE_ERROR
          },
          testProvider2
        ],
        originResults => {
          spies.testSelectorRead();
          return originResults;
        },
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("should return value returned by the provider returned in the catch", () => {
      return testSelector.read().then(value => {
        return test.expect(value).to.deep.equal([FOO_ORIGIN_3_VALUE, FOO_ORIGIN_2_VALUE]);
      });
    });

    test.it("should not clean cache in any provider cache is cleaned", () => {
      return testSelector.read().then(testSelectorCalledOnce);
    });

    test.it("should clean cache when provider returned in catch is cleaned", () => {
      return testSelector.read().then(() => {
        testProvider3.clean();
        return testSelector.read().then(() => {
          return test.expect(spies.testSelectorRead).to.have.been.calledTwice();
        });
      });
    });

    test.it("should receive Selector query in the catch function", () => {
      return testSelector
        .query(FORCE_ERROR)
        .read()
        .then(() => {
          return test.expect(spies.testProvider3Read).to.have.been.calledWith({
            receivedQuery: FORCE_ERROR
          });
        });
    });
  });

  test.describe("with parallel request queried", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [
          {
            provider: testProvider,
            query: query => query
          },
          {
            provider: testProvider2,
            query: query => query
          }
        ],
        {
          provider: testProvider3,
          query: (query, previousResults) => {
            return previousResults;
          }
        },
        originResults => {
          spies.testSelectorRead();
          return originResults;
        },
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.describe("execution order", () => {
      test.it(
        "should call to both providers in parallel, passing the query values, and the previousResults values",
        () => {
          const QUERY = "foo-query";
          return testSelector
            .query(QUERY)
            .read()
            .then(() => {
              return Promise.all([
                test.expect(spies.testProviderRead).to.have.been.calledWith(QUERY),
                test.expect(spies.testProvider2Read).to.have.been.calledWith(QUERY),
                test
                  .expect(spies.testProvider3Read)
                  .to.have.been.calledWith([[FOO_ORIGIN_VALUE, FOO_ORIGIN_2_VALUE]])
              ]);
            });
        }
      );
    });

    test.describe("cache", () => {
      test.describe("when one provider cache is cleaned", () => {
        test.it("should clean cache", queryAndCleanAndCheckCalledTwice);
      });

      test.describe("when no provider cache is cleaned", () => {
        test.it("should not execute method twice", queryAndReadTwiceAndCheckCalledOnce);
      });
    });
  });

  test.describe("with parallel requests combined with single request", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [testProvider, testProvider2],
        testProvider3,
        (parallelResults, origin3Results) => ({
          parallel: parallelResults,
          single: origin3Results
        }),
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("should return value returned by parser function", () => {
      return testSelector.read().then(value => {
        return test.expect(value).to.deep.equal({
          parallel: [FOO_ORIGIN_VALUE, FOO_ORIGIN_2_VALUE],
          single: FOO_ORIGIN_3_VALUE
        });
      });
    });

    test.it(
      "should call to first two providers in parallel, next one when first are resolved",
      () => {
        const read = testSelector.read();
        return Promise.all([
          test.expect(spies.testProviderRead).to.have.been.called(),
          test.expect(spies.testProvider2Read).to.have.been.called(),
          test.expect(spies.testProvider3Read).to.not.have.been.called(),
          read
        ]);
      }
    );

    test.it("should have called to all providers when read has finished", () => {
      return testSelector.read().then(() => {
        return Promise.all([
          test.expect(spies.testProviderRead).to.have.been.called(),
          test.expect(spies.testProvider2Read).to.have.been.called(),
          test.expect(spies.testProvider3Read).to.have.been.called()
        ]);
      });
    });
  });

  test.describe("with parallel requests combined with single request returning an error", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [
          testProvider,
          {
            provider: testProvider2,
            query: () => FORCE_ERROR
          }
        ],
        testProvider3,
        (parallelResults, origin3Results) => ({
          parallel: parallelResults,
          single: origin3Results
        }),
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("should return an error", () => {
      return testSelector.read().then(
        () => {
          return test.assert.fail();
        },
        err => {
          return test.expect(err.message).to.equal(FORCE_ERROR);
        }
      );
    });
  });

  test.describe("with chained parallel requests", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [testProvider, [testProvider2, testProvider3]],
        results => results,
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("should return value returned by parser function", () => {
      return testSelector.read().then(value => {
        return test
          .expect(value)
          .to.deep.equal([FOO_ORIGIN_VALUE, [FOO_ORIGIN_2_VALUE, FOO_ORIGIN_3_VALUE]]);
      });
    });

    test.it("should call to all providers in parallel", () => {
      const read = testSelector.read();
      return Promise.all([
        test.expect(spies.testProviderRead).to.have.been.called(),
        test.expect(spies.testProvider2Read).to.have.been.called(),
        test.expect(spies.testProvider3Read).to.have.been.called(),
        read
      ]);
    });
  });

  test.describe(
    "with parallel requests combined with single request, using selector that returns an origin",
    () => {
      test.beforeEach(() => {
        testSelector = new Selector(
          [testProvider, testProviderSelector],
          testProvider3,
          selectorMethod,
          {
            defaultValue: DEFAULT_VALUE
          }
        );
      });

      test.describe("value", () => {
        test.it("should return value returned by parser function", () => {
          return testSelector.read().then(value => {
            return test.expect(value).to.deep.equal({
              parallel: [FOO_ORIGIN_VALUE, FOO_ORIGIN_4_VALUE],
              single: FOO_ORIGIN_3_VALUE
            });
          });
        });
      });

      test.describe("execution order", () => {
        test.it(
          "should call to first two providers in parallel, next one when first are resolved",
          () => {
            const selector = testSelector.read();
            return Promise.all([
              test.expect(spies.testProviderRead).to.have.been.called(),
              test.expect(spies.testProvider4Read).to.not.have.been.called(), // because 4 depends of 3, and has a timeout
              test.expect(spies.testProvider3Read).to.have.been.called(), // because 4 depends of 3, and has a timeout
              selector
            ]);
          }
        );

        test.it("should have called to all providers when read has finished", () => {
          return testSelector.read().then(() => {
            return Promise.all([
              test.expect(spies.testProviderRead).to.have.been.calledOnce(),
              test.expect(spies.testProvider4Read).to.have.been.calledOnce(),
              test.expect(spies.testProvider3Read).to.have.been.calledTwice(),
              test.expect(spies.testProviderSelectorRead).to.have.been.calledOnce()
            ]);
          });
        });
      });

      test.describe("cache", () => {
        test.describe("when provider caches are not cleaned", () => {
          test.it("should execute read method once", () => {
            return testSelector.read().then(testSelectorCalledOnce);
          });

          test.it("should execute read method once when read is executed in parallel", () => {
            return Promise.all([
              testSelector.read(),
              testSelector.read(),
              testSelector.read(),
              testSelector.read()
            ]).then(testSelectorCalledOnce);
          });
        });
      });
    }
  );

  test.describe(
    "with parallel requests combined with single request, using selector that returns an origin. All queried",
    () => {
      const QUERY = "foo-query";
      test.beforeEach(() => {
        testSelector = new Selector(
          [
            {
              provider: testProvider,
              query: query => query
            },
            {
              provider: testProviderSelector,
              query: query => query
            }
          ],
          {
            provider: testProvider3,
            query: query => query
          },
          selectorMethod,
          {
            defaultValue: DEFAULT_VALUE
          }
        );
      });

      test.describe("execution order", () => {
        test.it("should have called to all providers passing query", () => {
          return testSelector
            .query(QUERY)
            .read()
            .then(() => {
              return Promise.all([
                test.expect(spies.testProviderRead).to.have.been.calledWith(QUERY),
                test.expect(spies.testProvider4Read).to.have.been.calledWith(QUERY),
                test.expect(spies.testProvider3Read).to.have.been.calledWith(QUERY),
                test.expect(spies.testProviderSelectorRead).to.have.been.calledWith(QUERY)
              ]);
            });
        });
      });

      test.describe("cache", () => {
        test.describe("when no cache is cleaned", () => {
          test.it("should execute read method once", queryAndReadTwiceAndCheckCalledOnce);
        });

        test.describe("when a provider cache is cleaned", () => {
          test.it("should clean cache", queryAndCleanAndCheckCalledTwice);
        });

        test.describe("when returned provider cache is cleaned", () => {
          test.it("should clean cache", () => {
            return testSelector
              .query(QUERY)
              .read()
              .then(() => {
                testProvider4.query(QUERY).clean();
                return testSelector
                  .query(QUERY)
                  .read()
                  .then(() => {
                    return test.expect(spies.testSelectorRead).to.have.been.calledTwice();
                  });
              });
          });
        });
      });
    }
  );
});
