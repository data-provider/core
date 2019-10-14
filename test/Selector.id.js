const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");
const helpers = require("../src/helpers");

test.describe("Selector id", () => {
  const FOO_ID = "foo-origin-id";
  const FOO_ID_2 = "foo-origin-2";
  const FOO_ID_3 = "foo-origin-3";
  const FOO_UUID = "foo-uuid";
  const FOO_CUSTOM_UUID = "foo-custom-uuid";
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testOrigin2;
  let testOrigin3;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    sandbox.stub(helpers, "uniqueId").returns(FOO_UUID);
    sandbox.stub(helpers, "queriedUniqueId").returns("foo-query-uuid");
    TestOrigin = class extends Origin {
      _read() {
        return Promise.resolve();
      }
    };
    testOrigin = new TestOrigin(FOO_ID);
    testOrigin2 = new TestOrigin(FOO_ID_2);
    testOrigin3 = new TestOrigin(FOO_ID_3);
    testSelector = new Selector(testOrigin, originResult => originResult);
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("without query", () => {
    test.it(
      "private property _id should be calculated using source id adding 'select:' prefix",
      () => {
        test.expect(helpers.uniqueId).to.have.been.calledWith(`select:${FOO_UUID}`, undefined);
      }
    );

    test.it("private property _id should be equal to custom uuid", () => {
      testSelector = new Selector(testOrigin, testOrigin2, originResult => originResult, {
        uuid: FOO_CUSTOM_UUID
      });
      test.expect(testSelector._id).to.equal(FOO_CUSTOM_UUID);
    });

    test.it(
      "private property _id should be calculated using sources ids adding 'select:' prefix and default value when provided in deprecated way",
      () => {
        testSelector = new Selector(
          testOrigin,
          testOrigin2,
          originResult => originResult,
          "foo-default-value"
        );
        test
          .expect(helpers.uniqueId)
          .to.have.been.calledWith(`select:${FOO_UUID}:${FOO_UUID}`, "foo-default-value");
      }
    );

    test.it(
      "private property _id should be calculated using sources ids adding 'select:' prefix and default value",
      () => {
        testSelector = new Selector(testOrigin, testOrigin2, originResult => originResult, {
          defaultValue: "foo-default-value"
        });
        test
          .expect(helpers.uniqueId)
          .to.have.been.calledWith(`select:${FOO_UUID}:${FOO_UUID}`, "foo-default-value");
      }
    );
  });

  test.describe("with query", () => {
    test.it(
      "private property _id should be calculated using sources ids adding 'select:' prefix and the query id",
      () => {
        testSelector.query("foo");
        test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_UUID, '("foo")');
      }
    );

    test.it("private property _id should be calculated using custom id and the query id", () => {
      testSelector = new Selector(testOrigin, originResult => originResult, {
        uuid: FOO_CUSTOM_UUID
      });
      testSelector.query("foo");
      test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_CUSTOM_UUID, '("foo")');
    });
  });

  test.describe("when sources are queryied", () => {
    test.it(
      "private property _id of queried resources should be calculated using sources ids and the query id",
      () => {
        testSelector = new Selector(
          {
            source: testOrigin,
            query: query => query
          },
          originResult => originResult
        ).query("foo");
        test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_UUID, '("foo")');
      }
    );

    test.it("private property _id should be calculated using custom uuid and the query id", () => {
      testSelector = new Selector(
        {
          source: testOrigin,
          query: query => query
        },
        originResult => originResult,
        {
          uuid: FOO_CUSTOM_UUID
        }
      ).query("foo");
      test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_CUSTOM_UUID, '("foo")');
    });
  });

  test.describe("when sources are concurrent", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        testOrigin = new TestOrigin(FOO_ID, undefined, {
          uuid: FOO_ID
        });
        testOrigin2 = new TestOrigin(FOO_ID_2, undefined, {
          uuid: FOO_ID_2
        });
        testOrigin3 = new TestOrigin(FOO_ID_3, undefined, {
          uuid: FOO_ID_3
        });
        testSelector = new Selector(
          [testOrigin3, testOrigin2],
          testOrigin,
          originResult => originResult
        );
        test
          .expect(helpers.uniqueId)
          .to.have.been.calledWith(`select:${FOO_ID_3}:${FOO_ID_2}:${FOO_ID}`, undefined);
      }
    );
  });

  test.describe("when sources are concurrently queryied", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        testOrigin = new TestOrigin(FOO_ID, undefined, {
          uuid: FOO_ID
        });
        testOrigin2 = new TestOrigin(FOO_ID_2, undefined, {
          uuid: FOO_ID_2
        });
        testOrigin3 = new TestOrigin(FOO_ID_3, undefined, {
          uuid: FOO_ID_3
        });
        testSelector = new Selector(
          testOrigin3,
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
          originResult => originResult
        );
        test
          .expect(helpers.uniqueId)
          .to.have.been.calledWith(`select:${FOO_ID_3}:${FOO_ID}:${FOO_ID_2}`, undefined);
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
        test.expect(helpers.uniqueId).to.have.been.calledWith(`select:${FOO_UUID}`, undefined);
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
        ).query("foo");
        test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_UUID, '("foo")');
      }
    );
  });
});
