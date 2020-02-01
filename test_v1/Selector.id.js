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
const helpers = require("../src/helpers");

test.describe("Selector id", () => {
  const FOO_ID = "foo-origin-id";
  const FOO_ID_2 = "foo-origin-2";
  const FOO_ID_3 = "foo-origin-3";
  const FOO_UUID = "foo-uuid";
  const FOO_CUSTOM_UUID = "foo-custom-uuid";
  let sandbox;
  let TestProvider;
  let testProvider;
  let testProvider2;
  let testProvider3;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    sandbox.stub(helpers, "uniqueId").returns(FOO_UUID);
    sandbox.stub(helpers, "queriedUniqueId").returns("foo-query-uuid");
    TestProvider = class extends Provider {
      _read() {
        return Promise.resolve();
      }
    };
    testProvider = new TestProvider(FOO_ID);
    testProvider2 = new TestProvider(FOO_ID_2);
    testProvider3 = new TestProvider(FOO_ID_3);
    testSelector = new Selector(testProvider, originResult => originResult);
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("without query", () => {
    test.it(
      "private property _id should be calculated using provider id adding 'select:' prefix",
      () => {
        test.expect(helpers.uniqueId).to.have.been.calledWith(`select:${FOO_UUID}`, undefined);
      }
    );

    test.it("private property _id should be equal to custom uuid", () => {
      testSelector = new Selector(testProvider, testProvider2, originResult => originResult, {
        uuid: FOO_CUSTOM_UUID
      });
      test.expect(testSelector._id).to.equal(FOO_CUSTOM_UUID);
    });

    test.it(
      "private property _id should be calculated using providers ids adding 'select:' prefix and default value when provided in deprecated way",
      () => {
        testSelector = new Selector(
          testProvider,
          testProvider2,
          originResult => originResult,
          "foo-default-value"
        );
        test
          .expect(helpers.uniqueId)
          .to.have.been.calledWith(`select:${FOO_UUID}:${FOO_UUID}`, "foo-default-value");
      }
    );

    test.it(
      "private property _id should be calculated using providers ids adding 'select:' prefix and default value",
      () => {
        testSelector = new Selector(testProvider, testProvider2, originResult => originResult, {
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
      "private property _id should be calculated using providers ids adding 'select:' prefix and the query id",
      () => {
        testSelector.query("foo");
        test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_UUID, '("foo")');
      }
    );

    test.it("private property _id should be calculated using custom id and the query id", () => {
      testSelector = new Selector(testProvider, originResult => originResult, {
        uuid: FOO_CUSTOM_UUID
      });
      testSelector.query("foo");
      test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_CUSTOM_UUID, '("foo")');
    });
  });

  test.describe("when providers are queryied", () => {
    test.it(
      "private property _id of queried reproviders should be calculated using providers ids and the query id",
      () => {
        testSelector = new Selector(
          {
            provider: testProvider,
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
          provider: testProvider,
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

  test.describe("when providers are concurrent", () => {
    test.it(
      "private property _id should be equal to providers ids adding 'select:' prefix and the query id",
      () => {
        testProvider = new TestProvider(FOO_ID, undefined, {
          uuid: FOO_ID
        });
        testProvider2 = new TestProvider(FOO_ID_2, undefined, {
          uuid: FOO_ID_2
        });
        testProvider3 = new TestProvider(FOO_ID_3, undefined, {
          uuid: FOO_ID_3
        });
        testSelector = new Selector(
          [testProvider3, testProvider2],
          testProvider,
          originResult => originResult
        );
        test
          .expect(helpers.uniqueId)
          .to.have.been.calledWith(`select:${FOO_ID_3}:${FOO_ID_2}:${FOO_ID}`, undefined);
      }
    );
  });

  test.describe("when providers are concurrently queryied", () => {
    test.it(
      "private property _id should be equal to providers ids adding 'select:' prefix and the query id",
      () => {
        testProvider = new TestProvider(FOO_ID, undefined, {
          uuid: FOO_ID
        });
        testProvider2 = new TestProvider(FOO_ID_2, undefined, {
          uuid: FOO_ID_2
        });
        testProvider3 = new TestProvider(FOO_ID_3, undefined, {
          uuid: FOO_ID_3
        });
        testSelector = new Selector(
          testProvider3,
          [
            {
              provider: testProvider,
              query: query => query
            },
            {
              provider: testProvider2,
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

  test.describe("when providers are selectors", () => {
    let testProviderSelector;

    test.beforeEach(() => {
      testProviderSelector = new Selector(
        {
          provider: testProvider,
          query: query => query
        },
        result => result
      );
    });

    test.it(
      "private property _id should be equal to providers ids adding 'select:' prefix and the selector id",
      () => {
        testSelector = new Selector(
          {
            provider: testProviderSelector,
            query: query => query
          },
          originResult => originResult
        );
        test.expect(helpers.uniqueId).to.have.been.calledWith(`select:${FOO_UUID}`, undefined);
      }
    );

    test.it(
      "private property _id should be equal to providers ids adding 'select:' prefix and the the query id",
      () => {
        testSelector = new Selector(
          {
            provider: testProviderSelector,
            query: query => query
          },
          originResult => originResult
        ).query("foo");
        test.expect(helpers.queriedUniqueId).to.have.been.calledWith(FOO_UUID, '("foo")');
      }
    );
  });
});
