const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector test methods", () => {
  const RESULT = "result";
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testSelector;
  let spies;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      query: sandbox.spy(),
      catch: sandbox.spy(),
      selector: sandbox.stub().callsFake(result => result)
    };
    TestOrigin = class extends Origin {
      _read() {
        return Promise.resolve(RESULT);
      }
    };
    testOrigin = new TestOrigin();
    testSelector = new Selector(
      {
        source: testOrigin,
        query: query => {
          spies.query();
          return query;
        },
        catch: err => {
          spies.catch();
          return err;
        }
      },
      spies.selector
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("sources query functions", () => {
    test.describe("when there are no concurrent queries", () => {
      test.it("should be avaible for testing at the test.queries property", () => {
        test.expect(testSelector.test.queries[0]("foo")).to.equal("foo");
        test.expect(spies.query).to.have.been.called();
      });
    });

    test.describe("when there are concurrent sources", () => {
      test.it("should be avaible for testing at the test.queries property as an array", () => {
        const testOrigin2 = new TestOrigin();
        testSelector = new Selector(
          [
            {
              source: testOrigin,
              query: query => {
                spies.query();
                return `${query}-1`;
              }
            },
            {
              source: testOrigin2,
              query: query => {
                spies.query();
                return `${query}-2`;
              }
            }
          ],
          spies.selector
        );
        test.expect(testSelector.test.queries[0][0]("foo")).to.equal("foo-1");
        test.expect(testSelector.test.queries[0][1]("foo")).to.equal("foo-2");
        test.expect(spies.query).to.have.been.calledTwice();
      });

      test.it("should have all concurrent queries available recursively", () => {
        const testOrigin2 = new TestOrigin();
        const testOrigin3 = new TestOrigin();
        testSelector = new Selector(
          [
            {
              source: testOrigin,
              query: query => {
                spies.query();
                return `${query}-1`;
              }
            },
            [
              {
                source: testOrigin2,
                query: query => {
                  spies.query();
                  return `${query}-2`;
                }
              },
              {
                source: testOrigin3,
                query: query => {
                  spies.query();
                  return `${query}-3`;
                }
              }
            ]
          ],
          spies.selector
        );
        test.expect(testSelector.test.queries[0][0]("foo")).to.equal("foo-1");
        test.expect(testSelector.test.queries[0][1][0]("foo")).to.equal("foo-2");
        test.expect(testSelector.test.queries[0][1][1]("foo")).to.equal("foo-3");
        test.expect(spies.query.callCount).to.equal(3);
      });
    });
  });

  test.describe("sources catch functions", () => {
    test.describe("when there are no concurrent sources", () => {
      test.it("should be avaible for testing at the test.catches property", () => {
        test.expect(testSelector.test.catches[0]("foo")).to.equal("foo");
        test.expect(spies.catch).to.have.been.called();
      });
    });

    test.describe("when there are concurrent sources", () => {
      test.it("should be avaible for testing at the test.catches property as an array", () => {
        const testOrigin2 = new TestOrigin();
        testSelector = new Selector(
          [
            {
              source: testOrigin,
              catch: err => {
                spies.catch();
                return `${err}-a`;
              }
            },
            {
              source: testOrigin2,
              catch: err => {
                spies.catch();
                return `${err}-b`;
              }
            }
          ],
          spies.selector
        );
        test.expect(testSelector.test.catches[0][0]("foo")).to.equal("foo-a");
        test.expect(testSelector.test.catches[0][1]("foo")).to.equal("foo-b");
        test.expect(spies.catch).to.have.been.calledTwice();
      });

      test.it("should have all concurrent catches available recursively", () => {
        const testOrigin2 = new TestOrigin();
        const testOrigin3 = new TestOrigin();
        testSelector = new Selector(
          [
            {
              source: testOrigin,
              catch: err => {
                spies.catch();
                return `${err}-a`;
              }
            },
            [
              {
                source: testOrigin2,
                catch: err => {
                  spies.catch();
                  return `${err}-b`;
                }
              },
              {
                source: testOrigin3,
                catch: err => {
                  spies.catch();
                  return `${err}-c`;
                }
              }
            ]
          ],
          spies.selector
        );
        test.expect(testSelector.test.catches[0][0]("foo")).to.equal("foo-a");
        test.expect(testSelector.test.catches[0][1][0]("foo")).to.equal("foo-b");
        test.expect(testSelector.test.catches[0][1][1]("foo")).to.equal("foo-c");
        test.expect(spies.catch.callCount).to.equal(3);
      });
    });
  });

  test.describe("selector function", () => {
    test.it("should be avaible for testing at the test.selector property", () => {
      test.expect(testSelector.test.selector("foo")).to.equal("foo");
      test.expect(spies.selector).to.have.been.called();
    });
  });
});
