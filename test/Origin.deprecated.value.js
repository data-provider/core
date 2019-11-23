/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider value", () => {
  const DEFAULT_VALUE = [];
  const VALUE = "foo-read-result";
  let sandbox;
  let TestProvider;
  let testProvider;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestProvider = class extends Provider {
      _read() {
        return Promise.resolve(VALUE);
      }
    };
    testProvider = new TestProvider("foo-id", DEFAULT_VALUE);
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("using getter", () => {
    test.it("should return a clone of defaultValue until it load first time", () => {
      test.expect(testProvider.read.getters.value()).to.deep.equal(DEFAULT_VALUE);
      test.expect(testProvider.read.getters.value()).to.not.equal(DEFAULT_VALUE);
    });

    test.it("should change getter property when it has finished loading", () => {
      return testProvider.read().then(() => {
        test.expect(testProvider.read.getters.value()).to.equal(VALUE);
      });
    });
  });

  test.describe("Without query", () => {
    test.it("should return a clone of defaultValue until it load first time", () => {
      test.expect(testProvider.read.value).to.deep.equal(DEFAULT_VALUE);
      test.expect(testProvider.read.value).to.not.equal(DEFAULT_VALUE);
    });

    test.it("should change value property when it has finished loading", () => {
      return testProvider.read().then(() => {
        return test.expect(testProvider.read.value).to.equal(VALUE);
      });
    });

    test.it("should return value in read promise", () => {
      return testProvider.read().then(value => {
        return test.expect(value).to.equal(VALUE);
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return a clone of defaultValue until it load first time", () => {
      test.expect(testProvider.query(QUERY).read.value).to.deep.equal(DEFAULT_VALUE);
      test.expect(testProvider.query(QUERY).read.value).to.not.equal(DEFAULT_VALUE);
    });

    test.it("should change value property when it has finished loading", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(testProvider.query(QUERY).read.value).to.equal(VALUE);
        });
    });

    test.it("should return value in read promise", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(value => {
          return test.expect(value).to.equal(VALUE);
        });
    });
  });
});
