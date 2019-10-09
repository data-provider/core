const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector using parallel sources", () => {
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
  let TestOrigin;
  let testOrigin;
  let TestOrigin2;
  let testOrigin2;
  let TestOrigin3;
  let testOrigin3;
  let TestOrigin4;
  let testOrigin4;
  let testOriginSelector;
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

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      testOriginRead: sandbox.spy(),
      testOrigin2Read: sandbox.spy(),
      testOrigin3Read: sandbox.spy(),
      testOrigin4Read: sandbox.spy(),
      testOriginSelectorRead: sandbox.spy(),
      testSelectorRead: sandbox.spy()
    };
    TestOrigin = class extends Origin {
      _read(query) {
        spies.testOriginRead(query);
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
    testOrigin = new TestOrigin();
    TestOrigin2 = class extends Origin {
      _read(query) {
        spies.testOrigin2Read(query);
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
    testOrigin2 = new TestOrigin2();
    TestOrigin3 = class extends Origin {
      _read(query) {
        spies.testOrigin3Read(query);
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
    testOrigin3 = new TestOrigin3();
    TestOrigin4 = class extends Origin {
      _read(query) {
        spies.testOrigin4Read(query);
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
    testOrigin4 = new TestOrigin4();
    testOriginSelector = new Selector(
      {
        source: testOrigin3,
        query: query => query
      },
      (testOriginResult, query) => {
        spies.testOriginSelectorRead(query);
        if (query === FORCE_ERROR) {
          return Promise.reject(new Error(FORCE_ERROR));
        }
        return testOrigin4.query(query);
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("with parallel sources", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [testOrigin, testOrigin2],
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
      test.it("should call to both sources in parallel", () => {
        const read = testSelector.read();
        return Promise.all([
          test.expect(spies.testOriginRead).to.have.been.called(),
          test.expect(spies.testOrigin2Read).to.have.been.called(),
          read
        ]);
      });
    });

    test.describe("when source cache is cleaned", () => {
      test.it("should clean cache", () => {
        return testSelector.read().then(() => {
          testOrigin2.clean();
          return testSelector.read().then(() => {
            return test.expect(spies.testSelectorRead).to.have.been.calledTwice();
          });
        });
      });
    });
  });

  test.describe("with parallel sources catching error", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [
          {
            source: testOrigin,
            catch: () => {
              return Promise.resolve("error");
            },
            query: () => FORCE_ERROR
          },
          testOrigin2
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

  test.describe("with parallel sources catching error and returning another source", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [
          {
            source: testOrigin,
            catch: (error, query) => {
              const queryObject = query && {
                receivedQuery: query
              };
              return testOrigin3.query(queryObject);
            },
            query: query => query || FORCE_ERROR
          },
          testOrigin2
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

    test.it("should return value returned by the source returned in the catch", () => {
      return testSelector.read().then(value => {
        return test.expect(value).to.deep.equal([FOO_ORIGIN_3_VALUE, FOO_ORIGIN_2_VALUE]);
      });
    });

    test.it("should not clean cache in any source cache is cleaned", () => {
      return testSelector.read().then(testSelectorCalledOnce);
    });

    test.it("should clean cache when source returned in catch is cleaned", () => {
      return testSelector.read().then(() => {
        testOrigin3.clean();
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
          return test.expect(spies.testOrigin3Read).to.have.been.calledWith({
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
            source: testOrigin,
            query: query => query
          },
          {
            source: testOrigin2,
            query: query => query
          }
        ],
        {
          source: testOrigin3,
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
        "should call to both sources in parallel, passing the query values, and the previousResults values",
        () => {
          const QUERY = "foo-query";
          return testSelector
            .query(QUERY)
            .read()
            .then(() => {
              return Promise.all([
                test.expect(spies.testOriginRead).to.have.been.calledWith(QUERY),
                test.expect(spies.testOrigin2Read).to.have.been.calledWith(QUERY),
                test
                  .expect(spies.testOrigin3Read)
                  .to.have.been.calledWith([[FOO_ORIGIN_VALUE, FOO_ORIGIN_2_VALUE]])
              ]);
            });
        }
      );
    });

    test.describe("cache", () => {
      test.describe("when one source cache is cleaned", () => {
        test.it("should clean cache", () => {
          const QUERY = "foo-query";
          return testSelector
            .query(QUERY)
            .read()
            .then(() => {
              testOrigin.query(QUERY).clean();
              return testSelector
                .query(QUERY)
                .read()
                .then(() => {
                  return test.expect(spies.testSelectorRead).to.have.been.calledTwice();
                });
            });
        });
      });

      test.describe("when no source cache is cleaned", () => {
        test.it("should not execute method twice", () => {
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
        });
      });
    });
  });

  test.describe("with parallel requests combined with single request", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [testOrigin, testOrigin2],
        testOrigin3,
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
      "should call to first two sources in parallel, next one when first are resolved",
      () => {
        const read = testSelector.read();
        return Promise.all([
          test.expect(spies.testOriginRead).to.have.been.called(),
          test.expect(spies.testOrigin2Read).to.have.been.called(),
          test.expect(spies.testOrigin3Read).to.not.have.been.called(),
          read
        ]);
      }
    );

    test.it("should have called to all sources when read has finished", () => {
      return testSelector.read().then(() => {
        return Promise.all([
          test.expect(spies.testOriginRead).to.have.been.called(),
          test.expect(spies.testOrigin2Read).to.have.been.called(),
          test.expect(spies.testOrigin3Read).to.have.been.called()
        ]);
      });
    });
  });

  test.describe("with parallel requests combined with single request returning an error", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        [
          testOrigin,
          {
            source: testOrigin2,
            query: () => FORCE_ERROR
          }
        ],
        testOrigin3,
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
      testSelector = new Selector([testOrigin, [testOrigin2, testOrigin3]], results => results, {
        defaultValue: DEFAULT_VALUE
      });
    });

    test.it("should return value returned by parser function", () => {
      return testSelector.read().then(value => {
        return test
          .expect(value)
          .to.deep.equal([FOO_ORIGIN_VALUE, [FOO_ORIGIN_2_VALUE, FOO_ORIGIN_3_VALUE]]);
      });
    });

    test.it("should call to all sources in parallel", () => {
      const read = testSelector.read();
      return Promise.all([
        test.expect(spies.testOriginRead).to.have.been.called(),
        test.expect(spies.testOrigin2Read).to.have.been.called(),
        test.expect(spies.testOrigin3Read).to.have.been.called(),
        read
      ]);
    });
  });

  test.describe(
    "with parallel requests combined with single request, using selector that returns an origin",
    () => {
      test.beforeEach(() => {
        testSelector = new Selector(
          [testOrigin, testOriginSelector],
          testOrigin3,
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
          "should call to first two sources in parallel, next one when first are resolved",
          () => {
            const selector = testSelector.read();
            return Promise.all([
              test.expect(spies.testOriginRead).to.have.been.called(),
              test.expect(spies.testOrigin4Read).to.not.have.been.called(), // because 4 depends of 3, and has a timeout
              test.expect(spies.testOrigin3Read).to.have.been.called(), // because 4 depends of 3, and has a timeout
              selector
            ]);
          }
        );

        test.it("should have called to all sources when read has finished", () => {
          return testSelector.read().then(() => {
            return Promise.all([
              test.expect(spies.testOriginRead).to.have.been.calledOnce(),
              test.expect(spies.testOrigin4Read).to.have.been.calledOnce(),
              test.expect(spies.testOrigin3Read).to.have.been.calledTwice(),
              test.expect(spies.testOriginSelectorRead).to.have.been.calledOnce()
            ]);
          });
        });
      });

      test.describe("cache", () => {
        test.describe("when source caches are not cleaned", () => {
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
              source: testOrigin,
              query: query => query
            },
            {
              source: testOriginSelector,
              query: query => query
            }
          ],
          {
            source: testOrigin3,
            query: query => query
          },
          selectorMethod,
          {
            defaultValue: DEFAULT_VALUE
          }
        );
      });

      test.describe("execution order", () => {
        test.it("should have called to all sources passing query", () => {
          return testSelector
            .query(QUERY)
            .read()
            .then(() => {
              return Promise.all([
                test.expect(spies.testOriginRead).to.have.been.calledWith(QUERY),
                test.expect(spies.testOrigin4Read).to.have.been.calledWith(QUERY),
                test.expect(spies.testOrigin3Read).to.have.been.calledWith(QUERY),
                test.expect(spies.testOriginSelectorRead).to.have.been.calledWith(QUERY)
              ]);
            });
        });
      });

      test.describe("cache", () => {
        test.describe("when no cache is cleaned", () => {
          test.it("should execute read method once", () => {
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
          });
        });

        test.describe("when a source cache is cleaned", () => {
          test.it("should clean cache", () => {
            return testSelector
              .query(QUERY)
              .read()
              .then(() => {
                testOrigin.query(QUERY).clean();
                return testSelector
                  .query(QUERY)
                  .read()
                  .then(() => {
                    return test.expect(spies.testSelectorRead).to.have.been.calledTwice();
                  });
              });
          });
        });

        test.describe("when returned source cache is cleaned", () => {
          test.it("should clean cache", () => {
            return testSelector
              .query(QUERY)
              .read()
              .then(() => {
                testOrigin4.query(QUERY).clean();
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
