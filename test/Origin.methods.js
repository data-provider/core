/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin methods", () => {
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  const testMethod = methodName => {
    test.describe(`when Origin has _${methodName} method defined`, () => {
      let TestOrigin;
      let testOrigin;
      let spys;
      test.beforeEach(() => {
        spys = {
          create: sandbox.spy(),
          read: sandbox.spy(),
          update: sandbox.spy(),
          delete: sandbox.spy()
        };

        TestOrigin = class extends Origin {
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

        testOrigin = new TestOrigin();
      });

      test.describe("Without query", () => {
        test.it(`should return an instance with ${methodName} method`, () => {
          test.expect(testOrigin[methodName]).to.not.be.undefined();
        });

        test.it(`should be called when ${methodName} method is called`, () => {
          return testOrigin[methodName]().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be called when ${methodName} method dispatch is called`, () => {
          return testOrigin[methodName].dispatch().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through loading getter`, () => {
          return testOrigin[methodName].getters.loading._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through value getter`, () => {
          return testOrigin[methodName].getters.value._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });

        test.it(`should be available through error getter`, () => {
          return testOrigin[methodName].getters.error._method().then(() => {
            return test.expect(spys[methodName]).to.have.been.called();
          });
        });
      });

      test.describe("With query", () => {
        let queried;
        test.beforeEach(() => {
          queried = testOrigin.query({
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
    test.describe(`when Origin has not _${methodName} method defined`, () => {
      test.it(`should return an instance without ${methodName} method`, () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin();
        test.expect(testOrigin[methodName]).to.be.undefined();
      });
    });
  };

  testEmptyMethod("create");
  testEmptyMethod("update");
  testEmptyMethod("read");
  testEmptyMethod("delete");
});
