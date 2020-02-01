/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider defaultValue", () => {
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("when Provider has defaultValue defined", () => {
    test.describe("read method", () => {
      test.describe("without query", () => {
        test.it("should return defaultValue until real value is returned", () => {
          const TestProvider = class extends Provider {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testProvider = new TestProvider("", 4);
          test.expect(testProvider.read.value).to.equal(4);
          return testProvider.read().then(() => {
            return test.expect(testProvider.read.value).to.equal(5);
          });
        });

        test.it("should return a clone of defaultValue", () => {
          const defaultValue = {
            foo: {
              foo2: "foo"
            }
          };
          const TestProvider = class extends Provider {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testProvider = new TestProvider("", defaultValue);
          test.expect(testProvider.read.value).to.not.equal(defaultValue);
          test.expect(testProvider.read.value).to.deep.equal(defaultValue);
        });
      });

      test.describe("with query", () => {
        test.it("should return defaultValue until real value is returned", () => {
          const QUERY = "foo";
          const TestProvider = class extends Provider {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testProvider = new TestProvider("", 4).query(QUERY);
          test.expect(testProvider.read.value).to.equal(4);
          return testProvider.read().then(() => {
            return test.expect(testProvider.read.value).to.equal(5);
          });
        });
      });

      test.describe("with chained query", () => {
        test.it("should return defaultValue until real value is returned", () => {
          const QUERY = "foo";
          const TestProvider = class extends Provider {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testProvider = new TestProvider("", 4).query(QUERY).query("foo2");
          test.expect(testProvider.read.value).to.equal(4);
          return testProvider.read().then(() => {
            return test.expect(testProvider.read.value).to.equal(5);
          });
        });
      });
    });

    const testMethodsWithNoDefaultValue = methodName => {
      const values = {
        create: "foo-create-value",
        update: "foo-update-value",
        delete: "foo-delete-value"
      };

      const TestProvider = class extends Provider {
        _create() {
          return Promise.resolve(values.create);
        }
        _update() {
          return Promise.resolve(values.update);
        }
        _delete() {
          return Promise.resolve(values.delete);
        }
      };

      test.describe(`${methodName} method`, () => {
        test.describe("without query", () => {
          test.it("should return undefined until real value is returned", () => {
            const testProvider = new TestProvider("", 4);
            test.expect(testProvider[methodName].value).to.be.undefined();
            return testProvider[methodName]().then(() => {
              return test.expect(testProvider[methodName].value).to.equal(values[methodName]);
            });
          });
        });

        test.describe("with query", () => {
          test.it("should return undefined until real value is returned", () => {
            const QUERY = "foo";
            const testProvider = new TestProvider("", 4).query(QUERY);
            test.expect(testProvider[methodName].value).to.be.undefined();
            return testProvider[methodName]().then(() => {
              return test.expect(testProvider[methodName].value).to.equal(values[methodName]);
            });
          });
        });
      });
    };

    testMethodsWithNoDefaultValue("create");
    testMethodsWithNoDefaultValue("update");
    testMethodsWithNoDefaultValue("delete");
  });
});
