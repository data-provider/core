/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");

describe("Selector dependencies cache", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let dependency1;
  let dependency2;
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
      dependency2: []
    };
    resolved = {
      dependency1: -1,
      dependency2: -1
    };
    timeouts = {
      dependency1: 200,
      dependency2: 1000
    };

    getProviderResult = dependencyId => {
      resolved[dependencyId]++;
      return results[dependencyId][resolved[dependencyId]];
    };

    spies = {
      dependenciesRead: {
        dependency1: sandbox.spy(),
        dependency2: sandbox.spy()
      },
      selectorRead: sinon.spy()
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

    selector = new Selector(dependency1, dependency2, (dependency1Result, dependency2Result) => {
      spies.selectorRead();
      return [dependency1Result, dependency2Result];
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  it("should return last data returned by all dependencies, even when a dependency cache is clean while reading", () => {
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3"]
    };
    expect.assertions(1);
    const promise = selector.read().then(results => {
      expect(results).toEqual(["foo2", "foo3"]);
    });
    setTimeout(() => {
      dependency1.cleanCache();
    }, 300);
    return promise;
  });

  it("should return last data returned by all dependencies, even when a dependency cache which throwed an error is clean while reading", async () => {
    results = {
      dependency1: ["foo"],
      dependency2: ["foo3", "foo4"]
    };
    const error = new Error();
    expect.assertions(1);
    const promise = selector.read().catch(err => {
      expect(err).toBe(error);
    });
    setTimeout(() => {
      hasToThrow = error;
      dependency2.cleanCache();
    }, 400);
    await promise;
  });

  it("should call to clean cache once when a cache dependency is clean", async () => {
    sandbox.spy(selector, "cleanCache");
    await selector.read();
    dependency1.cleanCache();
    dependency1.cleanCache();
    dependency2.cleanCache();
    expect(selector.cleanCache.callCount).toEqual(1);
  });

  it("should not call to clean until dependency has been completely read", async () => {
    sandbox.spy(selector, "cleanCache");
    selector.read();
    dependency1.cleanCache();
    dependency1.cleanCache();
    dependency2.cleanCache();
    await selector.read();
    expect(selector.cleanCache.callCount).toEqual(0);
  });

  it("should not call to clean until dependency has been completely read even when cache is clean while reading", async () => {
    sandbox.spy(selector, "cleanCache");
    let promise = selector.read().then(() => {
      expect(selector.cleanCache.callCount).toEqual(0);
    });
    dependency1.cleanCache();
    setTimeout(() => {
      dependency1.cleanCache();
    }, 600);
    dependency2.cleanCache();
    return promise;
  });

  it("should return last data returned by all dependencies, even when a dependency cache is clean while reading and dependencies are parallel", async () => {
    expect.assertions(3);
    let resolveTest;
    let testPromise = new Promise(resolve => {
      resolveTest = resolve;
    });
    selector = new Selector(
      [dependency1, dependency2],
      ([dependency1Result, dependency2Result]) => {
        spies.selectorRead();
        return [dependency1Result, dependency2Result];
      }
    );
    results = {
      dependency1: ["foo", "foo2"],
      dependency2: ["foo3", "foo4"]
    };
    const result = await selector.read();
    expect(result).toEqual(["foo", "foo3"]);
    selector.on("cleanCache", () => {
      selector.read().then(results => {
        expect(results).toEqual(["foo2", "foo4"]);
      });
      setTimeout(() => {
        selector.read().then(results => {
          expect(results).toEqual(["foo2", "foo4"]);
          resolveTest();
        });
      }, 200);
    });
    dependency1.cleanCache();
    dependency2.cleanCache();
    return testPromise;
  });
});
