/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");

describe("Selector dependencies", () => {
  const DEPENDENCY_1_RESULT = "dependency-1-result";
  const DEPENDENCY_2_RESULT = "dependency-2-result";
  let sandbox;
  let spies;
  let TestProvider;
  let dependency1;
  let dependency2;
  let selector;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    spies = {
      dependency1Read: sinon.spy(),
      dependency2Read: sinon.spy(),
      selectorRead: sinon.spy()
    };

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise(resolve => {
          this.options.spy(this.queryValue);
          setTimeout(() => {
            resolve(this.options.return);
          }, 50);
        });
      }
    };

    dependency1 = new TestProvider("dependency-1", {
      spy: spies.dependency1Read,
      return: DEPENDENCY_1_RESULT
    });
    dependency2 = new TestProvider("dependency-2", {
      spy: spies.dependency2Read,
      return: DEPENDENCY_2_RESULT
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when defined as data provider instance", () => {
    beforeEach(() => {
      selector = new Selector(dependency1, dependencyResult => {
        spies.selectorRead();
        return dependencyResult;
      });
    });

    it("should receive dependency result in selector function", async () => {
      const result = await selector.read();
      expect(result).toEqual(DEPENDENCY_1_RESULT);
    });

    it("should execute dependency only once when called multiple times", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should clean cache when dependency cache is clean", async () => {
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });

  describe("when defined with an invalid data provider", () => {
    beforeEach(() => {
      selector = new Selector("foo", dependencyResult => {
        return dependencyResult;
      });
    });

    it("should resolve with result", async () => {
      expect.assertions(1);
      const data = await selector.read();
      expect(data).toEqual("foo");
    });
  });

  describe("when defined as data provider instances", () => {
    beforeEach(() => {
      selector = new Selector(dependency1, dependency2, (dependency1Result, dependency2Result) => {
        spies.selectorRead({
          dependency1Result,
          dependency2Result
        });
        return {
          dependency1Result,
          dependency2Result
        };
      });
    });

    it("should receive dependencies result in selector function", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        dependency1Result: DEPENDENCY_1_RESULT,
        dependency2Result: DEPENDENCY_2_RESULT
      });
    });

    it("should execute dependencies only once when called multiple times", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should clean cache when dependency 1 cache is clean", async () => {
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      dependency2.cleanCache();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should clean cache only once when dependency 1 and dependency 2 caches are clean", async () => {
      sinon.spy(selector, "cleanCache");
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      dependency1.cleanCache();
      dependency2.cleanCache();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
      expect(selector.cleanCache.callCount).toEqual(1);
    });
  });

  describe("when defined as data provider instances array", () => {
    beforeEach(() => {
      selector = new Selector(
        [dependency1, dependency2],
        ([dependency1Result, dependency2Result]) => {
          spies.selectorRead({
            dependency1Result,
            dependency2Result
          });
          return {
            dependency1Result,
            dependency2Result
          };
        }
      );
    });

    it("should receive dependencies result in selector function", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        dependency1Result: DEPENDENCY_1_RESULT,
        dependency2Result: DEPENDENCY_2_RESULT
      });
    });

    it("should execute dependencies only once when called multiple times", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should clean cache when dependency 1 cache is clean", async () => {
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      dependency2.cleanCache();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });

  describe("when defined as a function returning data provider instance", () => {
    let querySpy;
    beforeEach(() => {
      querySpy = sandbox.spy();
      selector = new Selector(
        query => {
          querySpy(query);
          return dependency1;
        },
        dependencyResult => {
          spies.selectorRead();
          return dependencyResult;
        }
      );
    });

    it("should receive query as an argument in function", async () => {
      const QUERY = { foo: "foo" };
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
    });

    it("should receive dependency result in selector function", async () => {
      const result = await selector.read();
      expect(result).toEqual(DEPENDENCY_1_RESULT);
    });

    it("should execute dependency only once when called multiple times", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should clean cache when dependency cache is clean", async () => {
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });

  describe("when defined as functions returning data provider instances", () => {
    const QUERY = { foo: "foo" };
    let querySpy;
    let querySpy2;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      selector = new Selector(
        query => {
          querySpy(query);
          return dependency1.query(query);
        },
        (query, previousResults) => {
          querySpy2({
            query,
            previousResults
          });
          return dependency2.query(query);
        },
        (dependency1Result, dependency2Result) => {
          spies.selectorRead();
          return {
            dependency1Result,
            dependency2Result
          };
        }
      );
    });

    it("should receive query as an argument in all functions", async () => {
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as an argument in consequent functions", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].previousResults[0]).toEqual(DEPENDENCY_1_RESULT);
    });

    it("should receive dependencies results in selector function", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        dependency1Result: DEPENDENCY_1_RESULT,
        dependency2Result: DEPENDENCY_2_RESULT
      });
    });

    it("should execute dependency only once when called multiple times in query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times in query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency1Read.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should clean cache when dependency 1 cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      dependency1.cleanCache();
      await selector.query(QUERY).read();
      expect(spies.dependency1Read.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      dependency2.cleanCache();
      await selector.query(QUERY).read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });

  // TODO, test function returning array of dependencies
  // TODO, test function returning catchDependencies
  // TODO, test function returning array of functions
  // TODO, test promise as dependency
  // TODO, test value as dependency
  // TODO, test function returning value
  // TODO, test function returning promise
});
