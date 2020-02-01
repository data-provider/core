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

const CUD_ERROR =
  "@data-provider/core: CUD methods in Selectors can be used only when returning Provider instances";

test.describe("Selector cud methods", () => {
  let sandbox;
  let TestProvider;
  let testProvider;
  let TestProvider2;
  let testProvider2;
  let testSelector;
  let spies;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      create: sandbox.spy(),
      update: sandbox.spy(),
      delete: sandbox.spy()
    };
    TestProvider = class extends Provider {
      _read() {
        return Promise.resolve();
      }
    };
    testProvider = new TestProvider();
    TestProvider2 = class extends Provider {
      _create(query, params) {
        spies.create(query, params);
        return Promise.resolve();
      }
      _update(query, params) {
        spies.update(query, params);
        return Promise.resolve();
      }
      _delete(query, params) {
        spies.delete(query, params);
        return Promise.resolve();
      }
    };
    testProvider2 = new TestProvider2();
    testSelector = new Selector(
      {
        provider: testProvider,
        query: query => query
      },
      (results, query) => {
        return testProvider2.query(query);
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  const testMethod = methodName => {
    test.describe(`${methodName} method`, () => {
      const FOO_PARAM = "foo";
      const FOO_QUERY = "foo-query";

      test.it("should return an error if selector does not return another provider", () => {
        testSelector = new Selector(testProvider, results => {
          return results;
        });
        return testSelector[methodName](FOO_PARAM).then(
          () => {
            return test.assert.fail();
          },
          err => {
            return test.expect(err.message).to.equal(CUD_ERROR);
          }
        );
      });

      test.it(`should call to ${methodName} method of returned provider`, () => {
        return testSelector[methodName](FOO_PARAM).then(() => {
          return test.expect(spies[methodName]).to.have.been.calledWith(undefined, FOO_PARAM);
        });
      });

      test.it(
        `should call to ${methodName} method of returned provider passing the current query`,
        () => {
          return testSelector
            .query(FOO_QUERY)
            [methodName](FOO_PARAM)
            .then(() => {
              return test.expect(spies[methodName]).to.have.been.calledWith(FOO_QUERY, FOO_PARAM);
            });
        }
      );
    });
  };

  testMethod("create");
  testMethod("update");
  testMethod("delete");
});
