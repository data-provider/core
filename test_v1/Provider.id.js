/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");
const helpers = require("../src/helpers");

test.describe("Provider id", () => {
  const FOO_ID = "foo-id";
  const FOO_UUID = "foo-uuid";
  const FOO_CUSTOM_UUID = "foo-custom-uuid";
  const TestProvider = class extends Provider {};
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    sandbox.stub(helpers, "uniqueId").returns(FOO_UUID);
    sandbox.stub(helpers, "queriedUniqueId").returns("foo-query-uuid");
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("Without query", () => {
    test.it("private property _id should be calculated based on default id", () => {
      new TestProvider(FOO_ID);
      test.expect(helpers.uniqueId).to.have.been.calledWith(FOO_ID, undefined);
    });

    test.it(
      "private property _id should be calculated based on default id and default value",
      () => {
        const fooDefaultValue = "foo-default-value";
        new TestProvider(FOO_ID, fooDefaultValue);
        test.expect(helpers.uniqueId).to.have.been.calledWith(FOO_ID, fooDefaultValue);
      }
    );

    test.it("private property _id should be custom uuid if provided", () => {
      const testProvider = new TestProvider(FOO_ID, undefined, {
        uuid: FOO_CUSTOM_UUID
      });
      test.expect(testProvider._id).to.equal(FOO_CUSTOM_UUID);
    });
  });

  test.describe("With query", () => {
    test.it(
      "private property _id should be equal to the combination of given id and the queryId",
      () => {
        new TestProvider("foo-id").query({
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
        new TestProvider(FOO_ID, undefined, {
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
        new TestProvider(FOO_ID, "foo-default-value", {
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
        new TestProvider("foo-id")
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
        new TestProvider(FOO_ID, undefined, {
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
