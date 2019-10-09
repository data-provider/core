const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector value", () => {
  const FOO_ORIGIN_VALUE = {
    foo: "foo"
  };
  const FOO_ORIGIN_2_VALUE = {
    foo2: "foo2"
  };
  const FOO_ORIGIN_3_VALUE = {
    foo3: "foo3"
  };
  const DEFAULT_VALUE = { foo: "default" };
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

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      testOriginRead: sandbox.spy(),
      testOrigin2Read: sandbox.spy(),
      testOrigin3Read: sandbox.spy()
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
    };
    testOrigin3 = new TestOrigin3();
    testOriginSelector = new Selector(
      {
        source: testOrigin3,
        query: query => query
      },
      results => results
    );
    testSelector = new Selector(
      testOrigin,
      testOrigin2,
      (originResult, origin2Result) => ({
        ...originResult,
        ...origin2Result
      }),
      {
        defaultValue: DEFAULT_VALUE
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("using getter", () => {
    test.it("should return a clone of defaultValue until it load first time", () => {
      test.expect(testSelector.read.getters.value()).to.deep.equal(DEFAULT_VALUE);
      test.expect(testSelector.read.getters.value()).to.not.equal(DEFAULT_VALUE);
    });

    test.it("should change getter property when it has finished loading", () => {
      return testSelector.read().then(() => {
        test.expect(testSelector.read.getters.value()).to.deep.equal({
          ...FOO_ORIGIN_VALUE,
          ...FOO_ORIGIN_2_VALUE
        });
      });
    });
  });

  test.describe("without query", () => {
    test.it("should return value returned by parser function", () => {
      return testSelector.read().then(value => {
        return test.expect(value).to.deep.equal({
          ...FOO_ORIGIN_VALUE,
          ...FOO_ORIGIN_2_VALUE
        });
      });
    });
  });

  test.describe("with queried sources", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        {
          source: testOrigin,
          query: query => query
        },
        {
          source: testOrigin2,
          query: query => query
        },
        (originResult, origin2Result) => ({
          ...originResult,
          ...origin2Result
        }),
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("should return value returned by parser function", () => {
      return testSelector.read().then(value => {
        return test.expect(value).to.deep.equal({
          ...FOO_ORIGIN_VALUE,
          ...FOO_ORIGIN_2_VALUE
        });
      });
    });

    test.describe("when no query is passed", () => {
      test.it("should dispatch read methods of sources applying the resultant queries", () => {
        return testSelector.read().then(() => {
          return Promise.all([
            test.expect(spies.testOriginRead).to.have.been.called(),
            test.expect(spies.testOrigin2Read).to.have.been.called()
          ]);
        });
      });
    });

    test.describe("when query is passed", () => {
      test.it("should dispatch read methods of sources applying the resultant queries", () => {
        const QUERY = "foo";
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return Promise.all([
              test.expect(spies.testOriginRead).to.have.been.calledWith(QUERY),
              test.expect(spies.testOrigin2Read).to.have.been.calledWith(QUERY)
            ]);
          });
      });
    });
  });

  test.describe("with queried selector", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        {
          source: testOrigin,
          query: query => query
        },
        {
          source: testOrigin2,
          query: query => query
        },
        {
          source: testOriginSelector,
          query: query => query
        },
        (originResult, origin2Result, selectorResult) => ({
          ...originResult,
          ...origin2Result,
          ...selectorResult
        }),
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("should return value returned by parser function", () => {
      return testSelector.read().then(value => {
        return test.expect(value).to.deep.equal({
          ...FOO_ORIGIN_VALUE,
          ...FOO_ORIGIN_2_VALUE,
          ...FOO_ORIGIN_3_VALUE
        });
      });
    });

    test.describe("when no query is passed", () => {
      test.it("should dispatch read methods of sources applying the resultant queries", () => {
        return testSelector.read().then(() => {
          return Promise.all([
            test.expect(spies.testOriginRead).to.have.been.called(),
            test.expect(spies.testOrigin2Read).to.have.been.called(),
            test.expect(spies.testOrigin3Read).to.have.been.called()
          ]);
        });
      });
    });

    test.describe("when query is passed", () => {
      test.it("should dispatch read methods of sources applying the resultant queries", () => {
        const QUERY = "foo";
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return Promise.all([
              test.expect(spies.testOriginRead).to.have.been.calledWith(QUERY),
              test.expect(spies.testOrigin2Read).to.have.been.calledWith(QUERY),
              test.expect(spies.testOrigin3Read).to.have.been.calledWith(QUERY)
            ]);
          });
      });
    });
  });

  test.describe("with queried sources applying previousResults", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        {
          source: testOrigin,
          query: query => query
        },
        {
          source: testOrigin2,
          query: (query, previousResults) => ({
            query,
            prev: previousResults
          })
        },
        (originResult, origin2Result) => ({
          ...originResult,
          ...origin2Result
        }),
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.describe("when query is passed", () => {
      test.it("should dispatch read methods of sources applying the resultant queries", () => {
        const QUERY = "foo";
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return Promise.all([
              test.expect(spies.testOriginRead).to.have.been.calledWith(QUERY),
              test.expect(spies.testOrigin2Read).to.have.been.calledWith({
                query: QUERY,
                prev: [FOO_ORIGIN_VALUE]
              })
            ]);
          });
      });
    });
  });

  test.describe("with query applied on selector function", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        testOrigin,
        testOrigin2,
        (originResult, origin2Result, query) => ({
          query,
          ...originResult,
          ...origin2Result
        }),
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.describe("when query is passed", () => {
      test.it("should receive query in selector function", () => {
        const QUERY = "foo";
        return testSelector
          .query(QUERY)
          .read()
          .then(result => {
            return test.expect(result).to.deep.equal({
              query: QUERY,
              ...FOO_ORIGIN_VALUE,
              ...FOO_ORIGIN_2_VALUE
            });
          });
      });
    });
  });

  test.describe("when selector function returns a promise", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        testOrigin,
        testOrigin2,
        (originResult, origin2Result) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ...originResult,
                ...origin2Result
              });
            }, 50);
          });
        },
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.it("it should return the result returned by the promise", () => {
      return testSelector.read().then(result => {
        return test.expect(result).to.deep.equal({
          ...FOO_ORIGIN_VALUE,
          ...FOO_ORIGIN_2_VALUE
        });
      });
    });
  });

  test.describe("when selector function returns another origin", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        testOrigin,
        testOrigin2,
        (originResult, origin2Result, query) => {
          return testOrigin3.query(query);
        },
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.describe("when no query is applied", () => {
      test.it("it should return the result returned by read method of the returned source", () => {
        return testSelector.read().then(result => {
          return test.expect(result).to.deep.equal(FOO_ORIGIN_3_VALUE);
        });
      });
    });
  });

  test.describe("when selector function returns another selector", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        testOrigin,
        testOrigin2,
        () => {
          return testOriginSelector;
        },
        {
          defaultValue: DEFAULT_VALUE
        }
      );
    });

    test.describe("when no query is applied", () => {
      test.it(
        "it should return the result returned by read method of the returned selector",
        () => {
          return testSelector.read().then(result => {
            return test.expect(result).to.deep.equal(FOO_ORIGIN_3_VALUE);
          });
        }
      );
    });
  });
});
