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

test.describe("Selector returning another providers", () => {
  let sandbox;
  let testProviderResult;
  let testSelectorResult;
  let testSelector2Result;
  let updateProviderResult;
  const TestProvider = class extends Provider {
    constructor(options) {
      super();
      this._readResult = options.readResult;
      this._updateResult = options.updateResult;
    }
    _read() {
      return Promise.resolve(this._readResult);
    }
    _update() {
      return Promise.resolve(this._updateResult);
    }
  };
  let testProvider;
  let testSelector;
  let testSelector2;
  let dynamicSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    testProviderResult = "read result";
    updateProviderResult = "updated";
    testSelectorResult = "foo-selector-result";
    testSelector2Result = "foo-selector-2-result";
    testProvider = new TestProvider({
      readResult: testProviderResult,
      updateResult: updateProviderResult
    });
    testSelector = new Selector(testProvider, () => testSelectorResult, {
      uuid: "test-selector"
    });
    testSelector2 = new Selector(testProvider, () => testSelector2Result, {
      uuid: "test-selector-2"
    });
    sandbox.spy(testSelector.update);
    sandbox.spy(testSelector2.update);
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("calling to read method", () => {
    test.describe("when returns one provider", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testProvider, () => {
          return testSelector;
        });
      });

      test.it("should return the result returned by provider", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.equal(testSelectorResult);
        });
      });
    });

    test.describe("when returns multiple providers", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testProvider, () => {
          return [testSelector, testSelector2];
        });
      });

      test.it("should return the result returned by all providers", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.deep.equal([testSelectorResult, testSelector2Result]);
        });
      });
    });

    test.describe("when returns another provider with catch", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testProvider, () => {
          return {
            provider: testSelector,
            catch: () => Promise.resolve("Foo catch result")
          };
        });
      });

      test.it("should return the result returned by catch", () => {
        sandbox.stub(testSelector.read, "dispatch").rejects(new Error());
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.equal("Foo catch result");
        });
      });
    });

    test.describe("when returns multiple providers with catch", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testProvider, () => {
          return [
            {
              provider: testSelector,
              catch: () => Promise.resolve("Foo catch result")
            },
            {
              provider: testSelector2,
              query: () => "foo2"
            }
          ];
        });
      });

      test.it("should return the providers results, including result returned by catch", () => {
        sandbox.stub(testSelector.read, "dispatch").rejects(new Error());
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.deep.equal(["Foo catch result", testSelector2Result]);
        });
      });
    });

    test.describe("when returns multiple providers with queries", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testProvider, () => {
          return [
            {
              provider: testSelector,
              query: () => "foo"
            },
            {
              provider: testSelector2,
              query: () => "foo2"
            },
            {
              provider: testSelector2,
              query: () => "foo3"
            }
          ];
        });
      });

      test.it("should return the result returned by all providers", () => {
        return dynamicSelector.read().then(result => {
          return test
            .expect(result)
            .to.deep.equal([testSelectorResult, testSelector2Result, testSelector2Result]);
        });
      });
    });

    test.describe("when returns providers recursively", () => {
      let recursiveSelector;
      test.beforeEach(() => {
        recursiveSelector = new Selector(
          testProvider,
          () => {
            return testSelector2;
          },
          {
            uuid: "recursive-selector"
          }
        );

        dynamicSelector = new Selector(testProvider, () => {
          return recursiveSelector;
        });
      });

      test.it("should return the result returned by last provider", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.equal(testSelector2Result);
        });
      });
    });

    test.describe("when returns multiple providers recursively", () => {
      let recursiveSelector;
      test.beforeEach(() => {
        recursiveSelector = new Selector(
          testProvider,
          () => {
            return [testSelector2, testSelector];
          },
          {
            uuid: "recursive-selector"
          }
        );

        dynamicSelector = new Selector(testProvider, () => {
          return recursiveSelector;
        });
      });

      test.it("should return the result returned by last providers", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.deep.equal([testSelector2Result, testSelectorResult]);
        });
      });
    });
  });

  test.describe("calling to CUD method", () => {
    test.describe("when returns one origin", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testProvider, () => {
          return testProvider;
        });
      });

      test.it("should call to same method of returned provider", () => {
        return dynamicSelector.update().then(result => {
          return test.expect(result).to.equal(updateProviderResult);
        });
      });
    });

    test.describe("when returns multiple origins", () => {
      let testProvider2;
      let updateProviderResult2;
      test.beforeEach(() => {
        updateProviderResult2 = "foo-update-origin-2-result";
        testProvider2 = new TestProvider({
          readResult: testProviderResult,
          updateResult: updateProviderResult2
        });
        dynamicSelector = new Selector(testProvider, () => {
          return [testProvider, testProvider2];
        });
      });

      test.it("should call to same method of returned provider", () => {
        return dynamicSelector.update().then(result => {
          return test.expect(result).to.deep.equal([updateProviderResult, updateProviderResult2]);
        });
      });
    });

    test.describe("when returns another providers recursively", () => {
      let recursiveSelector;
      test.beforeEach(() => {
        dynamicSelector = new Selector(testProvider, () => {
          return testProvider;
        });

        recursiveSelector = new Selector(testProvider, () => {
          return dynamicSelector;
        });
      });

      test.it("should call to same method of last provider", () => {
        return recursiveSelector.update().then(result => {
          return test.expect(result).to.equal(updateProviderResult);
        });
      });
    });

    test.describe("when returns multiple providers recursively", () => {
      let testProvider2;
      let recursiveSelector;
      let updateResult2;

      test.beforeEach(() => {
        updateResult2 = "update-result-2";
        testProvider2 = new TestProvider({
          readResult: testProviderResult,
          updateResult: updateResult2
        });

        dynamicSelector = new Selector(testProvider, () => {
          return [testProvider, testProvider2];
        });

        recursiveSelector = new Selector(testProvider, () => {
          return dynamicSelector;
        });
      });

      test.it("should call to same method of last provider", () => {
        return recursiveSelector.update().then(result => {
          return test.expect(result).to.deep.equal([updateProviderResult, updateResult2]);
        });
      });
    });
  });
});
