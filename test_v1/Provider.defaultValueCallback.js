/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider defaultValue as callback", () => {
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("when Provider has defaultValue callback defined", () => {
    test.describe("read method", () => {
      test.describe("without query", () => {
        test.it(
          "should return the result of defaultValue callback until real value is returned",
          () => {
            const TestProvider = class extends Provider {
              constructor(id, defaultValue, options) {
                const getDefaultValue = () => {
                  return defaultValue + 2;
                };
                super(id, getDefaultValue, options);
              }

              _read() {
                return Promise.resolve(5);
              }
            };
            const testProvider = new TestProvider("", 4);
            test.expect(testProvider.read.value).to.equal(6);
            return testProvider.read().then(() => {
              return test.expect(testProvider.read.value).to.equal(5);
            });
          }
        );
      });

      test.describe("with query", () => {
        const QUERY = "foo-query";
        const TestProvider = class extends Provider {
          constructor(id, defaultValue, options) {
            const getDefaultValue = query => {
              return query;
            };
            super(id, getDefaultValue, options);
          }

          _read() {
            return Promise.resolve("foo-result");
          }
        };

        test.describe("with simple query", () => {
          test.it(
            "should pass query to defaultValue callback, and return the result until real value is returned",
            () => {
              const testProvider = new TestProvider("", 4).query(QUERY);
              test.expect(testProvider.read.value).to.equal("foo-query");
              return testProvider.read().then(() => {
                return test.expect(testProvider.read.value).to.equal("foo-result");
              });
            }
          );
        });

        test.describe("with chained query", () => {
          test.it(
            "should pass chained query to defaultValue callback, and return the result until real value is returned",
            () => {
              const testProvider = new TestProvider("", 4)
                .query({
                  foo: "foo"
                })
                .query({
                  foo2: "foo2"
                });
              test.expect(testProvider.read.value).to.deep.equal({
                foo: "foo",
                foo2: "foo2"
              });
              return testProvider.read().then(() => {
                return test.expect(testProvider.read.value).to.equal("foo-result");
              });
            }
          );
        });
      });
    });
  });
});
