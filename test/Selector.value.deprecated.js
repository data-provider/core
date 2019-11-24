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

test.describe("Selector value defining default value in deprecated way", () => {
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
  let TestProvider;
  let testProvider;
  let TestProvider2;
  let testProvider2;
  let TestProvider3;
  let testProvider3;
  let testProviderSelector;
  let testSelector;
  let spies;

  const checkSelectorValue = () => {
    return testSelector.read().then(value => {
      return test.expect(value).to.deep.equal({
        ...FOO_ORIGIN_VALUE,
        ...FOO_ORIGIN_2_VALUE
      });
    });
  };

  const checkSelectorHasProvider3Value = () => {
    return testSelector.read().then(result => {
      return test.expect(result).to.deep.equal(FOO_ORIGIN_3_VALUE);
    });
  };

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      testProviderRead: sandbox.spy(),
      testProvider2Read: sandbox.spy(),
      testProvider3Read: sandbox.spy()
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
    };
    testProvider3 = new TestProvider3();
    testProviderSelector = new Selector(
      {
        provider: testProvider3,
        query: query => query
      },
      results => results
    );
    testSelector = new Selector(
      testProvider,
      testProvider2,
      (originResult, origin2Result) => ({
        ...originResult,
        ...origin2Result
      }),
      DEFAULT_VALUE
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
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
    test.it("should return value returned by parser function", checkSelectorValue);
  });

  test.describe("with queried providers", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        {
          provider: testProvider,
          query: query => query
        },
        {
          provider: testProvider2,
          query: query => query
        },
        (originResult, origin2Result) => ({
          ...originResult,
          ...origin2Result
        }),
        DEFAULT_VALUE
      );
    });

    test.it("should return value returned by parser function", checkSelectorValue);

    test.describe("when no query is passed", () => {
      test.it("should dispatch read methods of providers applying the resultant queries", () => {
        return testSelector.read().then(() => {
          return Promise.all([
            test.expect(spies.testProviderRead).to.have.been.called(),
            test.expect(spies.testProvider2Read).to.have.been.called()
          ]);
        });
      });
    });

    test.describe("when query is passed", () => {
      test.it("should dispatch read methods of providers applying the resultant queries", () => {
        const QUERY = "foo";
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return Promise.all([
              test.expect(spies.testProviderRead).to.have.been.calledWith(QUERY),
              test.expect(spies.testProvider2Read).to.have.been.calledWith(QUERY)
            ]);
          });
      });
    });
  });

  test.describe("with queried selector", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        {
          provider: testProvider,
          query: query => query
        },
        {
          provider: testProvider2,
          query: query => query
        },
        {
          provider: testProviderSelector,
          query: query => query
        },
        (originResult, origin2Result, selectorResult) => ({
          ...originResult,
          ...origin2Result,
          ...selectorResult
        }),
        DEFAULT_VALUE
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
      test.it("should dispatch read methods of providers applying the resultant queries", () => {
        return testSelector.read().then(() => {
          return Promise.all([
            test.expect(spies.testProviderRead).to.have.been.called(),
            test.expect(spies.testProvider2Read).to.have.been.called(),
            test.expect(spies.testProvider3Read).to.have.been.called()
          ]);
        });
      });
    });

    test.describe("when query is passed", () => {
      test.it("should dispatch read methods of providers applying the resultant queries", () => {
        const QUERY = "foo";
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return Promise.all([
              test.expect(spies.testProviderRead).to.have.been.calledWith(QUERY),
              test.expect(spies.testProvider2Read).to.have.been.calledWith(QUERY),
              test.expect(spies.testProvider3Read).to.have.been.calledWith(QUERY)
            ]);
          });
      });
    });
  });

  test.describe("with queried providers applying previousResults", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        {
          provider: testProvider,
          query: query => query
        },
        {
          provider: testProvider2,
          query: (query, previousResults) => ({
            query,
            prev: previousResults
          })
        },
        (originResult, origin2Result) => ({
          ...originResult,
          ...origin2Result
        }),
        DEFAULT_VALUE
      );
    });

    test.describe("when query is passed", () => {
      test.it("should dispatch read methods of providers applying the resultant queries", () => {
        const QUERY = "foo";
        return testSelector
          .query(QUERY)
          .read()
          .then(() => {
            return Promise.all([
              test.expect(spies.testProviderRead).to.have.been.calledWith(QUERY),
              test.expect(spies.testProvider2Read).to.have.been.calledWith({
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
        testProvider,
        testProvider2,
        (originResult, origin2Result, query) => ({
          query,
          ...originResult,
          ...origin2Result
        }),
        DEFAULT_VALUE
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
        testProvider,
        testProvider2,
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
        DEFAULT_VALUE
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
        testProvider,
        testProvider2,
        (originResult, origin2Result, query) => {
          return testProvider3.query(query);
        },
        DEFAULT_VALUE
      );
    });

    test.describe("when no query is applied", () => {
      test.it(
        "it should return the result returned by read method of the returned provider",
        checkSelectorHasProvider3Value
      );
    });
  });

  test.describe("when selector function returns another selector", () => {
    test.beforeEach(() => {
      testSelector = new Selector(
        testProvider,
        testProvider2,
        () => {
          return testProviderSelector;
        },
        DEFAULT_VALUE
      );
    });

    test.describe("when no query is applied", () => {
      test.it(
        "it should return the result returned by read method of the returned selector",
        checkSelectorHasProvider3Value
      );
    });
  });
});
