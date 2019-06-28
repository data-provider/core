const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
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
      selector: sandbox.spy()
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
        }
      },
      originResult => {
        spies.selector();
        return originResult;
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("origin query functions", () => {
    test.describe("when there are no concurrent queries", () => {
      test.it("should be avaible for testing at the test.queries property", () => {
        test.expect(testSelector.test.queries[0]("foo")).to.equal("foo");
        test.expect(spies.query).to.have.been.called();
      });
    });

    test.describe("when there are concurrent queries", () => {
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
          originResult => {
            spies.selector();
            return originResult;
          }
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
          originResult => {
            spies.selector();
            return originResult;
          }
        );
        test.expect(testSelector.test.queries[0][0]("foo")).to.equal("foo-1");
        test.expect(testSelector.test.queries[0][1][0]("foo")).to.equal("foo-2");
        test.expect(testSelector.test.queries[0][1][1]("foo")).to.equal("foo-3");
        test.expect(spies.query.callCount).to.equal(3);
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
