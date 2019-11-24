/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider methods", () => {
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  const testMethod = methodName => {
    test.describe(`when Provider has _${methodName} method defined`, () => {
      let TestProvider;
      let testProvider;
      let spys;
      test.beforeEach(() => {
        spys = {
          create: sandbox.spy(),
          read: sandbox.spy(),
          update: sandbox.spy(),
          delete: sandbox.spy()
        };

        TestProvider = class extends Provider {
          _create() {
            spys.create();
            return Promise.resolve();
          }
          _read() {
            spys.read();
            return Promise.resolve();
          }
          _update() {
            spys.update();
            return Promise.resolve();
          }
          _delete() {
            spys.delete();
            return Promise.resolve();
          }
        };

        testProvider = new TestProvider();
      });

      test.describe("Without query", () => {
        test.it(`should return an instance with ${methodName} method`, () => {
          test.expect(testProvider[methodName]).to.not.be.undefined();
        });

        test.it(`should be called when ${methodName} method is called`, () => {
          return testProvider[methodName]().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be called when ${methodName} method dispatch is called`, () => {
          return testProvider[methodName].dispatch().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through loading getter`, () => {
          return testProvider[methodName].getters.loading._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through value getter`, () => {
          return testProvider[methodName].getters.value._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through error getter`, () => {
          return testProvider[methodName].getters.error._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });
      });

      test.describe("With query", () => {
        let queried;
        test.beforeEach(() => {
          queried = testProvider.query({
            foo: "foo"
          });
        });

        test.it(`should return an instance with ${methodName} method`, () => {
          test.expect(queried[methodName]).to.not.be.undefined();
        });

        test.it(`should be called when ${methodName} method is called`, () => {
          return queried[methodName]().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be called when ${methodName} method dispatch is called`, () => {
          return queried[methodName].dispatch().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through loading getter`, () => {
          return queried[methodName].getters.loading._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through error getter`, () => {
          return queried[methodName].getters.error._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through value getter`, () => {
          return queried[methodName].getters.value._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });
      });
    });
  };

  testMethod("create");
  testMethod("update");
  testMethod("read");
  testMethod("delete");

  const testEmptyMethod = methodName => {
    test.describe(`when Provider has not _${methodName} method defined`, () => {
      test.it(`should return an instance without ${methodName} method`, () => {
        const TestProvider = class extends Provider {};
        const testProvider = new TestProvider();
        test.expect(testProvider[methodName]).to.be.undefined();
      });
    });
  };

  testEmptyMethod("create");
  testEmptyMethod("update");
  testEmptyMethod("read");
  testEmptyMethod("delete");
});
