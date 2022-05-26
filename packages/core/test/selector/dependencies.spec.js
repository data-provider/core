/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers, catchDependency } = require("../../src/index");

describe("Selector dependencies", () => {
  const DEPENDENCY_1_RESULT = "dependency-1-result";
  const DEPENDENCY_2_RESULT = "dependency-2-result";
  const DEPENDENCY_3_RESULT = "dependency-3-result";
  let sandbox;
  let spies;
  let TestProvider;
  let dependency1;
  let dependency2;
  let dependency3;
  let selector;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    spies = {
      dependency1Read: sinon.spy(),
      dependency2Read: sinon.spy(),
      dependency3Read: sinon.spy(),
      dependency4Read: sinon.spy(),
    };

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve) => {
          this.options.spy(this.queryValue);
          setTimeout(() => {
            resolve(this.options.return);
          }, 50);
        });
      }
    };

    dependency1 = new TestProvider({
      id: "dependency-1",
      spy: spies.dependency1Read,
      return: DEPENDENCY_1_RESULT,
    });
    dependency2 = new TestProvider({
      id: "dependency-2",
      spy: spies.dependency2Read,
      return: DEPENDENCY_2_RESULT,
    });
    dependency3 = new TestProvider({
      id: "dependency-3",
      spy: spies.dependency3Read,
      return: DEPENDENCY_3_RESULT,
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when defined as data provider instance", () => {
    beforeEach(() => {
      selector = new Selector(dependency1, (query, dependencyResult) => {
        spies.dependency4Read();
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
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should clean cache when dependency cache is clean", async () => {
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined with an invalid data provider", () => {
    beforeEach(() => {
      selector = new Selector("foo", (query, dependencyResult) => {
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
      selector = new Selector(
        dependency1,
        dependency2,
        (query, dependency1Result, dependency2Result) => {
          spies.dependency4Read({
            dependency1Result,
            dependency2Result,
          });
          return {
            dependency1Result,
            dependency2Result,
          };
        }
      );
    });

    it("should receive dependencies result in selector function", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        dependency1Result: DEPENDENCY_1_RESULT,
        dependency2Result: DEPENDENCY_2_RESULT,
      });
    });

    it("should execute dependencies only once when called multiple times", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should clean cache when dependency 1 cache is clean", async () => {
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      dependency2.cleanCache();
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache only once when dependency 1 and dependency 2 caches are clean", async () => {
      sinon.spy(selector, "cleanCache");
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      dependency1.cleanCache();
      dependency2.cleanCache();
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(2);
      expect(selector.cleanCache.callCount).toEqual(1);
    });
  });

  describe("when defined as data provider instances array", () => {
    beforeEach(() => {
      selector = new Selector(
        [dependency1, dependency2],
        (query, [dependency1Result, dependency2Result]) => {
          spies.dependency4Read({
            dependency1Result,
            dependency2Result,
          });
          return {
            dependency1Result,
            dependency2Result,
          };
        }
      );
    });

    it("should receive dependencies result in selector function", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        dependency1Result: DEPENDENCY_1_RESULT,
        dependency2Result: DEPENDENCY_2_RESULT,
      });
    });

    it("should execute dependencies only once when called multiple times", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should clean cache when dependency 1 cache is clean", async () => {
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      dependency2.cleanCache();
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as a function returning data provider instance", () => {
    let querySpy;
    beforeEach(() => {
      querySpy = sandbox.spy();
      selector = new Selector(
        (query) => {
          querySpy(query);
          return dependency1;
        },
        (query, dependencyResult) => {
          spies.dependency4Read();
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
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should clean cache when dependency cache is clean", async () => {
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      dependency1.cleanCache();
      await selector.read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as functions returning data provider instances", () => {
    const QUERY = { foo: "foo" };
    let querySpy;
    let querySpy2;
    let querySpy3;
    let querySpy4;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      querySpy4 = sandbox.spy();
      selector = new Selector(
        (query) => {
          querySpy(query);
          return dependency1.query(query);
        },
        (query, dependency1Result) => {
          querySpy2({
            query,
            dependency1Result,
          });
          return dependency2.query(query);
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          return dependency3.query(query);
        },
        (query, dependency1Result, dependency2Result, dependency3Result) => {
          querySpy4({
            query,
            dependency1Result,
            dependency2Result,
            dependency3Result,
          });
          spies.dependency4Read();
          return {
            query,
            dependency1Result,
            dependency2Result,
            dependency3Result,
          };
        }
      );
    });

    it("should receive query as an argument in all functions", async () => {
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy4.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent functions", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual(DEPENDENCY_1_RESULT);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual(DEPENDENCY_1_RESULT);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual(DEPENDENCY_2_RESULT);
      expect(querySpy4.getCall(0).args[0].dependency1Result).toEqual(DEPENDENCY_1_RESULT);
      expect(querySpy4.getCall(0).args[0].dependency2Result).toEqual(DEPENDENCY_2_RESULT);
      expect(querySpy4.getCall(0).args[0].dependency3Result).toEqual(DEPENDENCY_3_RESULT);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: DEPENDENCY_1_RESULT,
        dependency2Result: DEPENDENCY_2_RESULT,
        dependency3Result: DEPENDENCY_3_RESULT,
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency1Read.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as functions returning an array of data-provider instances", () => {
    const QUERY = { foo: "foo" };
    let querySpy;
    let querySpy2;
    let querySpy3;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      selector = new Selector(
        (query) => {
          querySpy(query);
          return [dependency1.query(query), dependency2.query(query)];
        },
        (query, dependency1Result) => {
          querySpy2({
            query,
            dependency1Result,
          });
          return [dependency3.query(query)];
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return {
            query,
            dependency1Result,
            dependency2Result,
          };
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual([DEPENDENCY_3_RESULT]);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: [DEPENDENCY_3_RESULT],
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency1Read.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as functions returning catchDependencies", () => {
    const QUERY = { foo: "foo" };
    let querySpy;
    let querySpy2;
    let querySpy3;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      selector = new Selector(
        (query) => {
          querySpy(query);
          return [
            catchDependency(dependency1.query(query)),
            catchDependency(dependency2.query(query)),
          ];
        },
        (query, dependency1Result) => {
          querySpy2({
            query,
            dependency1Result,
          });
          return catchDependency([dependency3.query(query)]);
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return {
            query,
            dependency1Result,
            dependency2Result,
          };
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual([DEPENDENCY_3_RESULT]);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: [DEPENDENCY_3_RESULT],
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency1Read.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as functions returning an array of functions", () => {
    const QUERY = { foo: "foo" };
    let querySpy;
    let querySpy2;
    let querySpy3;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      selector = new Selector(
        () => {
          return (query) => {
            return [
              (queryValue) => {
                querySpy(queryValue);
                return dependency1.query(queryValue);
              },
              dependency2.query(query),
            ];
          };
        },
        () => {
          return (query, dependency1Result) => {
            querySpy2({
              query,
              dependency1Result,
            });
            return dependency3.query(query);
          };
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return {
            query,
            dependency1Result,
            dependency2Result,
          };
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual(DEPENDENCY_3_RESULT);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: DEPENDENCY_3_RESULT,
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency1Read.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
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
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as functions returning an array of data-provider instances and promises", () => {
    const QUERY = { foo: "foo" };
    let querySpy;
    let querySpy2;
    let querySpy3;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      selector = new Selector(
        (query) => {
          querySpy(query);
          return [
            new Promise((resolve) => {
              setTimeout(() => {
                resolve(DEPENDENCY_1_RESULT);
              }, 1000);
            }),
            dependency2.query(query),
          ];
        },
        (query, dependency1Result) => {
          querySpy2({
            query,
            dependency1Result,
          });
          return [dependency3.query(query)];
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return {
            query,
            dependency1Result,
            dependency2Result,
          };
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual([DEPENDENCY_3_RESULT]);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: [DEPENDENCY_3_RESULT],
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      dependency2.cleanCache();
      await selector.query(QUERY).read();
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as functions returning an array of data-provider instances and values", () => {
    const QUERY = { foo: "foo" };
    const DEPENDENCY_1_STATIC_RESULT = ["FOO", "FOO2"];
    const DEPENDENCY_3_STATIC_RESULT = "VAR";
    let querySpy;
    let querySpy2;
    let querySpy3;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      selector = new Selector(
        (query) => {
          querySpy(query);
          return [DEPENDENCY_1_STATIC_RESULT, dependency2.query(query)];
        },
        (query, dependency1Result) => {
          querySpy2({
            query,
            dependency1Result,
          });
          return () => DEPENDENCY_3_STATIC_RESULT;
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return {
            query,
            dependency1Result,
            dependency2Result,
          };
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_STATIC_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_STATIC_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual(DEPENDENCY_3_STATIC_RESULT);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_STATIC_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: DEPENDENCY_3_STATIC_RESULT,
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      dependency2.cleanCache();
      await selector.query(QUERY).read();
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as a Promise resolving an array of data-provider instances and values", () => {
    const QUERY = { foo: "foo" };
    let querySpy;
    let querySpy2;
    let querySpy3;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      selector = new Selector(
        new Promise((resolve) => {
          querySpy();
          setTimeout(() => {
            resolve([DEPENDENCY_1_RESULT, dependency2]);
          }, 1000);
        }),
        (query, dependency1Result) => {
          return [
            new Promise((resolve) => {
              setTimeout(() => {
                querySpy2({
                  query,
                  dependency1Result,
                });
                resolve(dependency3.query(query));
              }, 1000);
            }),
          ];
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return Promise.resolve({
            query,
            dependency1Result,
            dependency2Result,
          });
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual([DEPENDENCY_3_RESULT]);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: [DEPENDENCY_3_RESULT],
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      dependency2.cleanCache();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should execute promise again when selector cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
      selector.cleanCache();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1); // Promise is created in declaration time, so it will never be executed again
      expect(querySpy2.callCount).toEqual(2); // Promise is returned by a dependency function, so it is executed again
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as a plain values", () => {
    const QUERY = { foo: "foo" };
    let querySpy3;
    beforeEach(() => {
      querySpy3 = sandbox.spy();
      selector = new Selector(
        [DEPENDENCY_1_RESULT, dependency2],
        DEPENDENCY_3_RESULT,
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return Promise.resolve({
            query,
            dependency1Result,
            dependency2Result,
          });
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: DEPENDENCY_3_RESULT,
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      dependency2.cleanCache();
      await selector.query(QUERY).read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should execute promise again when selector cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(spies.dependency4Read.callCount).toEqual(1);
      selector.cleanCache();
      await selector.query(QUERY).read();
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });

  describe("when defined as a catched Promise resolving an array of data-provider instances and values", () => {
    const QUERY = { foo: "foo" };
    const errorToThrow = new Error();
    let querySpy;
    let querySpy2;
    let querySpy3;
    beforeEach(() => {
      querySpy = sandbox.spy();
      querySpy2 = sandbox.spy();
      querySpy3 = sandbox.spy();
      selector = new Selector(
        catchDependency(
          new Promise((resolve) => {
            querySpy();
            setTimeout(() => {
              resolve([DEPENDENCY_1_RESULT, dependency2]);
            }, 1000);
          })
        ),
        () => {
          return [
            catchDependency(
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  reject(errorToThrow);
                }, 1000);
              }),
              (error, query, dependency1Result) => {
                querySpy2({
                  error,
                  query,
                  dependency1Result,
                });
                return dependency3.query(query);
              }
            ),
          ];
        },
        (query, dependency1Result, dependency2Result) => {
          querySpy3({
            query,
            dependency1Result,
            dependency2Result,
          });
          spies.dependency4Read();
          return Promise.resolve({
            query,
            dependency1Result,
            dependency2Result,
          });
        }
      );
    });

    it("should receive query as an argument in all dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].query).toEqual(QUERY);
      expect(querySpy3.getCall(0).args[0].query).toEqual(QUERY);
    });

    it("should receive previous results as arguments in consequent dependencies", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency1Result).toEqual([
        DEPENDENCY_1_RESULT,
        DEPENDENCY_2_RESULT,
      ]);
      expect(querySpy3.getCall(0).args[0].dependency2Result).toEqual([DEPENDENCY_3_RESULT]);
    });

    it("should receive error in catch dependency method", async () => {
      await selector.query(QUERY).read();
      expect(querySpy2.getCall(0).args[0].error).toEqual(errorToThrow);
    });

    it("should receive dependencies results in last dependency", async () => {
      const result = await selector.read();
      expect(result).toEqual({
        query: {},
        dependency1Result: [DEPENDENCY_1_RESULT, DEPENDENCY_2_RESULT],
        dependency2Result: [DEPENDENCY_3_RESULT],
      });
    });

    it("should execute dependency only once when called multiple times if query does not change", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
    });

    it("should execute dependency more than once when called multiple times if query changes", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      await selector.query({ foo: "foo2" }).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should clean cache when dependency 2 cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      dependency2.cleanCache();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(2);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });

    it("should execute promise again when selector cache is clean", async () => {
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      selector.query(QUERY).read();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1);
      expect(querySpy2.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
      selector.cleanCache();
      await selector.query(QUERY).read();
      expect(querySpy.callCount).toEqual(1); // Promise is created in declaration time, so it will never be executed again
      expect(querySpy2.callCount).toEqual(2); // Promise is returned by a dependency function, so it is executed again
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(2);
    });
  });
});
