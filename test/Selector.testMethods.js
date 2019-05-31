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
    test.it("should be avaible for testing at the test.queries property", () => {
      test.expect(testSelector.test.queries[0]("foo")).to.equal("foo");
      test.expect(spies.query).to.have.been.called();
    });
  });

  test.describe("selector function", () => {
    test.it("should be avaible for testing at the test.selector property", () => {
      test.expect(testSelector.test.selector("foo")).to.equal("foo");
      test.expect(spies.selector).to.have.been.called();
    });
  });
});
