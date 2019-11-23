/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector returning another sources", () => {
  let sandbox;
  let testOriginResult;
  let testSelectorResult;
  let testSelector2Result;
  let updateOriginResult;
  const TestOrigin = class extends Origin {
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
  let testOrigin;
  let testSelector;
  let testSelector2;
  let dynamicSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    testOriginResult = "read result";
    updateOriginResult = "updated";
    testSelectorResult = "foo-selector-result";
    testSelector2Result = "foo-selector-2-result";
    testOrigin = new TestOrigin({
      readResult: testOriginResult,
      updateResult: updateOriginResult
    });
    testSelector = new Selector(testOrigin, () => testSelectorResult, {
      uuid: "test-selector"
    });
    testSelector2 = new Selector(testOrigin, () => testSelector2Result, {
      uuid: "test-selector-2"
    });
    sandbox.spy(testSelector.update);
    sandbox.spy(testSelector2.update);
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("calling to read method", () => {
    test.describe("when returns one source", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testOrigin, () => {
          return testSelector;
        });
      });

      test.it("should return the result returned by source", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.equal(testSelectorResult);
        });
      });
    });

    test.describe("when returns multiple sources", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testOrigin, () => {
          return [testSelector, testSelector2];
        });
      });

      test.it("should return the result returned by all sources", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.deep.equal([testSelectorResult, testSelector2Result]);
        });
      });
    });

    test.describe("when returns another source with catch", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testOrigin, () => {
          return {
            source: testSelector,
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

    test.describe("when returns multiple sources with catch", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testOrigin, () => {
          return [
            {
              source: testSelector,
              catch: () => Promise.resolve("Foo catch result")
            },
            {
              source: testSelector2,
              query: () => "foo2"
            }
          ];
        });
      });

      test.it("should return the sources results, including result returned by catch", () => {
        sandbox.stub(testSelector.read, "dispatch").rejects(new Error());
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.deep.equal(["Foo catch result", testSelector2Result]);
        });
      });
    });

    test.describe("when returns multiple sources with queries", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testOrigin, () => {
          return [
            {
              source: testSelector,
              query: () => "foo"
            },
            {
              source: testSelector2,
              query: () => "foo2"
            },
            {
              source: testSelector2,
              query: () => "foo3"
            }
          ];
        });
      });

      test.it("should return the result returned by all sources", () => {
        return dynamicSelector.read().then(result => {
          return test
            .expect(result)
            .to.deep.equal([testSelectorResult, testSelector2Result, testSelector2Result]);
        });
      });
    });

    test.describe("when returns sources recursively", () => {
      let recursiveSelector;
      test.beforeEach(() => {
        recursiveSelector = new Selector(
          testOrigin,
          () => {
            return testSelector2;
          },
          {
            uuid: "recursive-selector"
          }
        );

        dynamicSelector = new Selector(testOrigin, () => {
          return recursiveSelector;
        });
      });

      test.it("should return the result returned by last source", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.equal(testSelector2Result);
        });
      });
    });

    test.describe("when returns multiple sources recursively", () => {
      let recursiveSelector;
      test.beforeEach(() => {
        recursiveSelector = new Selector(
          testOrigin,
          () => {
            return [testSelector2, testSelector];
          },
          {
            uuid: "recursive-selector"
          }
        );

        dynamicSelector = new Selector(testOrigin, () => {
          return recursiveSelector;
        });
      });

      test.it("should return the result returned by last sources", () => {
        return dynamicSelector.read().then(result => {
          return test.expect(result).to.deep.equal([testSelector2Result, testSelectorResult]);
        });
      });
    });
  });

  test.describe("calling to CUD method", () => {
    test.describe("when returns one origin", () => {
      test.beforeEach(() => {
        dynamicSelector = new Selector(testOrigin, () => {
          return testOrigin;
        });
      });

      test.it("should call to same method of returned source", () => {
        return dynamicSelector.update().then(result => {
          return test.expect(result).to.equal(updateOriginResult);
        });
      });
    });

    test.describe("when returns multiple origins", () => {
      let testOrigin2;
      let updateOriginResult2;
      test.beforeEach(() => {
        updateOriginResult2 = "foo-update-origin-2-result";
        testOrigin2 = new TestOrigin({
          readResult: testOriginResult,
          updateResult: updateOriginResult2
        });
        dynamicSelector = new Selector(testOrigin, () => {
          return [testOrigin, testOrigin2];
        });
      });

      test.it("should call to same method of returned source", () => {
        return dynamicSelector.update().then(result => {
          return test.expect(result).to.deep.equal([updateOriginResult, updateOriginResult2]);
        });
      });
    });

    test.describe("when returns another sources recursively", () => {
      let recursiveSelector;
      test.beforeEach(() => {
        dynamicSelector = new Selector(testOrigin, () => {
          return testOrigin;
        });

        recursiveSelector = new Selector(testOrigin, () => {
          return dynamicSelector;
        });
      });

      test.it("should call to same method of last source", () => {
        return recursiveSelector.update().then(result => {
          return test.expect(result).to.equal(updateOriginResult);
        });
      });
    });

    test.describe("when returns multiple sources recursively", () => {
      let testOrigin2;
      let recursiveSelector;
      let updateResult2;

      test.beforeEach(() => {
        updateResult2 = "update-result-2";
        testOrigin2 = new TestOrigin({
          readResult: testOriginResult,
          updateResult: updateResult2
        });

        dynamicSelector = new Selector(testOrigin, () => {
          return [testOrigin, testOrigin2];
        });

        recursiveSelector = new Selector(testOrigin, () => {
          return dynamicSelector;
        });
      });

      test.it("should call to same method of last source", () => {
        return recursiveSelector.update().then(result => {
          return test.expect(result).to.deep.equal([updateOriginResult, updateResult2]);
        });
      });
    });
  });
});
