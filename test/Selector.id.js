const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector id", () => {
  const FOO_ID = "foo-origin-id";
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read() {
        return Promise.resolve();
      }
    };
    testOrigin = new TestOrigin(FOO_ID);
    testSelector = new Selector(testOrigin, originResult => originResult);
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("without query", () => {
    test.it("private property _id should be equal to sources ids adding 'select:' prefix", () => {
      test.expect(testSelector._id).to.equal(`select:${FOO_ID}`);
    });
  });

  test.describe("with query", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        test.expect(testSelector.query("foo")._id).to.equal(`select:${FOO_ID}-"foo"`);
      }
    );
  });

  test.describe("when sources are queryied", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        testSelector = new Selector(
          {
            source: testOrigin,
            query: query => query
          },
          originResult => originResult
        );
        test.expect(testSelector._id).to.equal(`select:${FOO_ID}`);
      }
    );
  });

  test.describe("when sources are selectors", () => {
    let testOriginSelector;

    test.beforeEach(() => {
      testOriginSelector = new Selector(
        {
          source: testOrigin,
          query: query => query
        },
        result => result
      );
    });

    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the selector id",
      () => {
        testSelector = new Selector(
          {
            source: testOriginSelector,
            query: query => query
          },
          originResult => originResult
        );
        test.expect(testSelector._id).to.equal(`select:select:foo-origin-id`);
      }
    );

    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the the query id",
      () => {
        testSelector = new Selector(
          {
            source: testOriginSelector,
            query: query => query
          },
          originResult => originResult
        );
        test.expect(testSelector.query("foo")._id).to.equal(`select:select:foo-origin-id-"foo"`);
      }
    );
  });
});
