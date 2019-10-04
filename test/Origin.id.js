const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const helpers = require("../src/helpers");

test.describe("Origin id", () => {
  const FOO_ID = "foo-id";
  const FOO_UUID = "foo-uuid";
  const FOO_CUSTOM_UUID = "foo-custom-uuid";
  const TestOrigin = class extends Origin {};
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    sandbox.stub(helpers, "uniqueId").returns(FOO_UUID);
    sandbox.stub(helpers, "queriedUniqueId").returns("foo-query-uuid");
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("Without query", () => {
    test.it("private property _id should be calculated based on default id", () => {
      new TestOrigin(FOO_ID);
      test.expect(helpers.uniqueId).to.have.been.calledWith(FOO_ID, undefined);
    });

    test.it(
      "private property _id should be calculated based on default id and default value",
      () => {
        const fooDefaultValue = "foo-default-value";
        new TestOrigin(FOO_ID, fooDefaultValue);
        test.expect(helpers.uniqueId).to.have.been.calledWith(FOO_ID, fooDefaultValue);
      }
    );

    test.it("private property _id should be custom uuid if provided", () => {
      const testOrigin = new TestOrigin(FOO_ID, undefined, {
        uuid: FOO_CUSTOM_UUID
      });
      test.expect(testOrigin._id).to.equal(FOO_CUSTOM_UUID);
    });
  });

  test.describe("With query", () => {
    test.it(
      "private property _id should be equal to the combination of given id and the queryId",
      () => {
        new TestOrigin("foo-id").query({
          foo: "foo-query"
        });
        test
          .expect(helpers.queriedUniqueId)
          .to.have.been.calledWith(FOO_UUID, '({"foo":"foo-query"})');
      }
    );

    test.it(
      "private property _id should be calculated using custom uuid if provided and the queryId",
      () => {
        new TestOrigin(FOO_ID, undefined, {
          uuid: FOO_CUSTOM_UUID
        }).query({
          foo: "foo-query"
        });
        test
          .expect(helpers.queriedUniqueId)
          .to.have.been.calledWith(FOO_CUSTOM_UUID, '({"foo":"foo-query"})');
      }
    );

    test.it(
      "private property _id should be calculated using custom uuid if provided and the queryId, ignoring default value",
      () => {
        new TestOrigin(FOO_ID, "foo-default-value", {
          uuid: FOO_CUSTOM_UUID
        }).query({
          foo: "foo-query"
        });
        test
          .expect(helpers.queriedUniqueId)
          .to.have.been.calledWith(FOO_CUSTOM_UUID, '({"foo":"foo-query"})');
      }
    );
  });

  test.describe("With chained query", () => {
    test.it(
      "private property _id should be equal to the combination of given id and the extension of the queries ids",
      () => {
        new TestOrigin("foo-id")
          .query({
            foo: "foo-query"
          })
          .query({
            foo2: "foo-query-2"
          });
        test
          .expect(helpers.queriedUniqueId)
          .to.have.been.calledWith(FOO_UUID, '({"foo":"foo-query","foo2":"foo-query-2"})');
      }
    );

    test.it(
      "private property _id should be custom uuid if provided and the extension of the queries ids",
      () => {
        new TestOrigin(FOO_ID, undefined, {
          uuid: FOO_CUSTOM_UUID
        })
          .query({
            foo: "foo-query"
          })
          .query({
            foo2: "foo-query-2"
          });
        test
          .expect(helpers.queriedUniqueId)
          .to.have.been.calledWith(FOO_CUSTOM_UUID, '({"foo":"foo-query","foo2":"foo-query-2"})');
      }
    );
  });
});
