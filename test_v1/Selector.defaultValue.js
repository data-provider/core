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

test.describe("Selector defaultValue", () => {
  const DEFAULT_VALUE = "foo-default-value";
  const VALUE = "foo-value";
  let sandbox;
  let TestProvider;
  let testProvider;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestProvider = class extends Provider {
      _read() {
        return Promise.resolve(VALUE);
      }
    };
    testProvider = new TestProvider();
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("when has defaultValue defined in deprecated way", () => {
    test.it("should return defaultValue until real value is returned", () => {
      testSelector = new Selector(testProvider, originResult => originResult, DEFAULT_VALUE);
      test.expect(testSelector.read.value).to.equal(DEFAULT_VALUE);
      return testSelector.read().then(() => {
        return test.expect(testSelector.read.value).to.equal(VALUE);
      });
    });
  });

  test.describe("when has defaultValue defined", () => {
    test.it("should return defaultValue until real value is returned", () => {
      testSelector = new Selector(testProvider, originResult => originResult, {
        defaultValue: DEFAULT_VALUE
      });
      test.expect(testSelector.read.value).to.equal(DEFAULT_VALUE);
      return testSelector.read().then(() => {
        return test.expect(testSelector.read.value).to.equal(VALUE);
      });
    });
  });
});
