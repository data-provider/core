/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

const CUD_ERROR = "CUD methods can be used only when returning @data-provider instances";

test.describe("Selector cud methods", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let TestOrigin2;
  let testOrigin2;
  let testSelector;
  let spies;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      create: sandbox.spy(),
      update: sandbox.spy(),
      delete: sandbox.spy()
    };
    TestOrigin = class extends Origin {
      _read() {
        return Promise.resolve();
      }
    };
    testOrigin = new TestOrigin();
    TestOrigin2 = class extends Origin {
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
    testOrigin2 = new TestOrigin2();
    testSelector = new Selector(
      {
        source: testOrigin,
        query: query => query
      },
      (results, query) => {
        return testOrigin2.query(query);
      }
    );
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  const testMethod = methodName => {
    test.describe(`${methodName} method`, () => {
      const FOO_PARAM = "foo";
      const FOO_QUERY = "foo-query";

      test.it("should return an error if selector does not return another source", () => {
        testSelector = new Selector(testOrigin, results => {
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

      test.it(`should call to ${methodName} method of returned source`, () => {
        return testSelector[methodName](FOO_PARAM).then(() => {
          return test.expect(spies[methodName]).to.have.been.calledWith(undefined, FOO_PARAM);
        });
      });

      test.it(
        `should call to ${methodName} method of returned source passing the current query`,
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
