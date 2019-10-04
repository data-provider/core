const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin id", () => {
  const FOO_ID = "foo-id";
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("Without query", () => {
    test.it("private property _id should be equal to given id", () => {
      const TestOrigin = class extends Origin {};
      const testOrigin = new TestOrigin("foo-id");
      test.expect(testOrigin._id).to.equal(FOO_ID);
    });
  });

  test.describe("With query", () => {
    test.it(
      "private property _id should be equal to the combination of given id and the queryId",
      () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin("foo-id").query({
          foo: "foo-query"
        });
        test.expect(testOrigin._id).to.equal(`${FOO_ID}-{"foo":"foo-query"}`);
      }
    );
  });

  test.describe("With chained query", () => {
    test.it(
      "private property _id should be equal to the combination of given id and the extension of the queries ids",
      () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin("foo-id")
          .query({
            foo: "foo-query"
          })
          .query({
            foo2: "foo-query-2"
          });
        test.expect(testOrigin._id).to.equal(`${FOO_ID}-{"foo":"foo-query","foo2":"foo-query-2"}`);
      }
    );
  });
});
