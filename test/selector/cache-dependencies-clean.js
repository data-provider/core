/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers, catchDependency } = require("../../src/index");

describe("Selector when cleanDependenciesCache method is called", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let dependency1;
  let dependency2;
  let dependency3;
  let dependency4;
  let selector;
  let getProviderResult;
  let resolved;
  let results;
  let timeouts;
  let hasToThrow;

  beforeEach(() => {
    hasToThrow = false;
    sandbox = sinon.createSandbox();
    results = {
      dependency1: [],
      dependency2: [],
      dependency3: [],
    };
    resolved = {
      dependency1: -1,
      dependency2: -1,
      dependency3: -1,
    };
    timeouts = {
      dependency1: 200,
      dependency2: 1000,
      dependency3: 1000,
    };

    getProviderResult = (dependencyId) => {
      resolved[dependencyId]++;
      return results[dependencyId][resolved[dependencyId]];
    };

    spies = {
      dependenciesRead: {
        dependency1: sandbox.spy(),
        dependency2: sandbox.spy(),
        dependency3: sandbox.spy(),
      },
      selectorRead: sinon.spy(),
    };

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve, reject) => {
          spies.dependenciesRead[this.id]();
          setTimeout(() => {
            if (!hasToThrow) {
              // console.log("Resolving", this.id);
              resolve(getProviderResult(this.id));
            } else {
              // console.log("Rejecting", this.id);
              reject(hasToThrow);
            }
          }, timeouts[this.id] || 50);
        });
      }
    };

    dependency1 = new TestProvider("dependency1");
    dependency2 = new TestProvider("dependency2");
    dependency3 = new TestProvider("dependency3");
    dependency4 = new Selector(dependency3, (dependencyResult) => {
      return dependencyResult;
    });

    selector = new Selector(
      dependency1,
      dependency2,
      dependency4,
      (dependency1Result, dependency2Result, dependency3Result) => {
        spies.selectorRead();
        return [dependency1Result, dependency2Result, dependency3Result];
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  it("should return last data returned by all dependencies when method is called", async () => {
    expect.assertions(2);
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3", "foo4"],
      dependency3: ["foo5", "foo6"],
    };
    const result = await selector.read();
    expect(result).toEqual(["foo", "foo3", "foo5"]);
    selector.cleanDependenciesCache();
    const result2 = await selector.read();
    expect(result2).toEqual(["foo2", "foo4", "foo6"]);
  });

  it("should work with dependencies as functions", async () => {
    expect.assertions(2);
    selector = new Selector(
      () => dependency1,
      () => dependency2,
      () => dependency4,
      (dependency1Result, dependency2Result, dependency3Result) => {
        spies.selectorRead();
        return [dependency1Result, dependency2Result, dependency3Result];
      }
    );
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3", "foo4"],
      dependency3: ["foo5", "foo6"],
    };
    const result = await selector.read();
    expect(result).toEqual(["foo", "foo3", "foo5"]);
    selector.cleanDependenciesCache();
    const result2 = await selector.read();
    expect(result2).toEqual(["foo2", "foo4", "foo6"]);
  });

  it("should ignore promise dependencies", async () => {
    expect.assertions(2);
    selector = new Selector(
      () => dependency1,
      () => dependency2,
      () => dependency4,
      new Promise((resolve) => resolve(5)),
      (dependency1Result, dependency2Result, dependency3Result, dependency4Result) => {
        spies.selectorRead();
        return [dependency1Result, dependency2Result, dependency3Result, dependency4Result];
      }
    );
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3", "foo4"],
      dependency3: ["foo5", "foo6"],
    };
    const result = await selector.read();
    expect(result).toEqual(["foo", "foo3", "foo5", 5]);
    selector.cleanDependenciesCache();
    const result2 = await selector.read();
    expect(result2).toEqual(["foo2", "foo4", "foo6", 5]);
  });

  it("should ignore value dependencies", async () => {
    expect.assertions(2);
    selector = new Selector(
      () => dependency1,
      () => dependency2,
      () => dependency4,
      5,
      (dependency1Result, dependency2Result, dependency3Result, dependency4Result) => {
        spies.selectorRead();
        return [dependency1Result, dependency2Result, dependency3Result, dependency4Result];
      }
    );
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3", "foo4"],
      dependency3: ["foo5", "foo6"],
    };
    const result = await selector.read();
    expect(result).toEqual(["foo", "foo3", "foo5", 5]);
    selector.cleanDependenciesCache();
    const result2 = await selector.read();
    expect(result2).toEqual(["foo2", "foo4", "foo6", 5]);
  });

  it("should return last data returned by all dependencies when method is called while reading", () => {
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3", "foo4"],
      dependency3: ["foo5", "foo6"],
    };
    expect.assertions(1);
    const promise = selector.read().then(async (result) => {
      expect(result).toEqual(["foo2", "foo4", "foo6"]);
    });
    setTimeout(() => {
      selector.cleanDependenciesCache();
    }, 1400);
    return promise;
  });

  it("should return last data returned by all dependencies, even when a dependency cache throwed an error", async () => {
    results = {
      dependency1: ["foo"],
      dependency2: ["foo3", "foo4"],
      dependency3: ["foo4", "foo5"],
    };
    const error = new Error();
    expect.assertions(1);
    const promise = selector.read().catch((err) => {
      expect(err).toBe(error);
    });
    setTimeout(() => {
      hasToThrow = error;
      selector.cleanDependenciesCache();
    }, 400);
    await promise;
  });

  it("should call to clean cache once", async () => {
    sandbox.spy(selector, "cleanCache");
    await selector.read();
    selector.cleanDependenciesCache();
    await selector.read();
    expect(selector.cleanCache.callCount).toEqual(1);
  });

  it("should not call to clean until dependencies have been completely read", async () => {
    sandbox.spy(selector, "cleanCache");
    selector.read();
    selector.cleanDependenciesCache();
    await selector.read();
    expect(selector.cleanCache.callCount).toEqual(0);
  });

  it("should not call to clean until dependencies have been completely read even when method is called while reading", async () => {
    sandbox.spy(selector, "cleanCache");
    let promise = selector.read().then(() => {
      expect(selector.cleanCache.callCount).toEqual(0);
    });
    selector.cleanDependenciesCache();
    setTimeout(() => {
      selector.cleanDependenciesCache();
    }, 600);
    selector.cleanDependenciesCache();
    return promise;
  });

  it("should stop reading dependencies and start again when method is called", async () => {
    expect.assertions(3);
    sandbox.spy(dependency1, "read");
    sandbox.spy(dependency2, "read");
    sandbox.spy(dependency3, "read");
    let dependency4HasToThrow = true;
    timeouts = {
      dependency1: 200,
      dependency2: 200,
      dependency3: 200,
    };
    const TestProvider2 = class extends Provider {
      readMethod() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (dependency4HasToThrow) {
              reject(new Error());
            } else {
              resolve();
            }
          }, 1000);
        });
      }
    };
    const dependency5 = new TestProvider2("dependency-5");
    selector = new Selector(
      catchDependency(dependency5, () => {
        return [dependency1, dependency2, dependency3];
      }),
      (result) => {
        spies.selectorRead();
        return result;
      }
    );
    const promise = selector.read().then(() => {
      expect(dependency1.read.callCount).toEqual(1);
      expect(dependency2.read.callCount).toEqual(1);
      expect(dependency3.read.callCount).toEqual(1);
    });
    setTimeout(() => {
      selector.cleanDependenciesCache();
    }, 300);
    return promise;
  });

  it("should stop reading dependencies and start again", async () => {
    expect.assertions(3);
    sandbox.spy(dependency1, "read");
    sandbox.spy(dependency2, "read");
    sandbox.spy(dependency3, "read");
    timeouts = {
      dependency1: 1000,
      dependency2: 1000,
      dependency3: 1000,
    };
    let promise = selector.read().then(() => {
      expect(dependency1.read.callCount).toEqual(2);
      expect(dependency2.read.callCount).toEqual(1); // cleanCache was called during dependency1 read, so 2 was not started
      expect(dependency3.read.callCount).toEqual(1);
    });
    setTimeout(() => {
      selector.cleanDependenciesCache();
    }, 200);
    return promise;
  });

  it("should return last data returned by all dependencies, even when method is called while reading and dependencies are parallel", async () => {
    expect.assertions(3);
    let resolveTest;
    let testPromise = new Promise((resolve) => {
      resolveTest = resolve;
    });
    selector = new Selector(
      [dependency1, dependency2, dependency3],
      ([dependency1Result, dependency2Result, dependency3Result]) => {
        spies.selectorRead();
        return [dependency1Result, dependency2Result, dependency3Result];
      }
    );
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3", "foo4"],
      dependency3: ["foo5", "foo6"],
    };
    const result = await selector.read();
    expect(result).toEqual(["foo", "foo3", "foo5"]);
    selector.on("cleanCache", () => {
      selector.read().then((selectorResult) => {
        expect(selectorResult).toEqual(["foo2", "foo4", "foo6"]);
      });
      setTimeout(() => {
        selector.read().then((selectorResult) => {
          expect(selectorResult).toEqual(["foo2", "foo4", "foo6"]);
          resolveTest();
        });
      }, 1400);
    });
    selector.cleanDependenciesCache();
    return testPromise;
  });
});
