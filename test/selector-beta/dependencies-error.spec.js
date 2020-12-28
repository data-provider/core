/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, SelectorBeta, providers, catchDependency } = require("../../src/index");

describe("Selector dependencies errors", () => {
  const DEPENDENCY_1_RESULT = "dependency-1-result";
  const DEPENDENCY_2_RESULT = "dependency-2-result";
  const FOO_ERROR = new Error();
  let sandbox;
  let TestProvider;
  let TestProvider2;
  let dependency1;
  let dependency2;
  let selector;
  let hasToThrow;
  let dependency1Timeout;

  beforeEach(() => {
    dependency1Timeout = 50;
    sandbox = sinon.createSandbox();
    hasToThrow = null;

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!hasToThrow) {
              resolve(this.options.return);
            } else {
              reject(new Error());
            }
          }, dependency1Timeout);
        });
      }
    };

    TestProvider2 = class extends Provider {
      readMethod() {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.options.return);
          }, 50);
        });
      }
    };

    dependency1 = new TestProvider("dependency-1", {
      return: DEPENDENCY_1_RESULT,
    });
    dependency2 = new TestProvider2("dependency-2", {
      return: DEPENDENCY_2_RESULT,
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when no catch property is defined", () => {
    let selectorSpy;
    beforeEach(() => {
      selectorSpy = sandbox.spy();
      sandbox.spy(dependency1, "read");
      sandbox.spy(dependency2, "read");
      selector = new SelectorBeta(dependency1, dependency2, (query, dependencyResult) => {
        selectorSpy();
        return dependencyResult;
      });
    });

    it("should reject with received error", async () => {
      expect.assertions(1);
      hasToThrow = FOO_ERROR;
      try {
        await selector.read();
      } catch (error) {
        expect(error).toEqual(FOO_ERROR);
      }
    });

    it("should stop reading dependencies on first fail", async () => {
      expect.assertions(1);
      hasToThrow = FOO_ERROR;
      try {
        await selector.read();
      } catch (error) {
        expect(dependency2.read.callCount).toEqual(0);
      }
    });

    it("should be able to catch error in promise", async () => {
      expect.assertions(1);
      hasToThrow = FOO_ERROR;
      await selector.read().catch((error) => {
        expect(error).toEqual(FOO_ERROR);
      });
    });

    it("should not cache dependency result", async () => {
      expect.assertions(1);
      hasToThrow = FOO_ERROR;
      await selector.read().catch(() => {});
      await selector.read().catch(() => {});
      expect(dependency1.read.callCount).toEqual(2);
    });

    it("should not cache selector result", async () => {
      expect.assertions(1);
      hasToThrow = FOO_ERROR;
      await selector.read().catch(() => {});
      hasToThrow = null;
      await selector.read();
      expect(selectorSpy.callCount).toEqual(1);
    });

    it("should emit a cleanCache event when dependency cache is clean", async () => {
      expect.assertions(2);
      dependency1Timeout = 2000;
      hasToThrow = FOO_ERROR;
      let eventReceived;
      const promiseResolver = new Promise((resolve) => {
        eventReceived = resolve;
      });
      selector.once("cleanCache", () => {
        selector.read().then((result) => {
          expect(result).toEqual(DEPENDENCY_1_RESULT);
          expect(selectorSpy.callCount).toEqual(1);
          eventReceived();
        });
      });
      await selector.read().catch(() => {});
      hasToThrow = null;
      dependency1.cleanCache();

      await promiseResolver;
    });
  });

  describe("when catchDependency is used", () => {
    let selectorSpy;
    let catchSpy;
    let catchReturns;

    beforeEach(() => {
      selectorSpy = sandbox.spy();
      catchSpy = sandbox.spy();
      sandbox.spy(dependency1, "read");
      selector = new SelectorBeta(
        catchDependency(dependency1, (err) => {
          catchSpy(err);
          return catchReturns;
        }),
        (query, dependencyResult) => {
          selectorSpy();
          return dependencyResult;
        }
      );
    });

    it("should receive error in catch property", async () => {
      hasToThrow = FOO_ERROR;
      await selector.read();
      expect(catchSpy.getCall(0).args[0]).toEqual(FOO_ERROR);
    });

    describe("when it returns a value", () => {
      it("should return the value as dependency value", async () => {
        const FOO_RESULT = "foo";
        hasToThrow = FOO_ERROR;
        catchReturns = FOO_RESULT;
        const result = await selector.read();
        expect(result).toEqual(FOO_RESULT);
      });

      it("should clean cache when dependency cache is clean", async () => {
        const FOO_RESULT = "foo";
        hasToThrow = FOO_ERROR;
        catchReturns = FOO_RESULT;
        await selector.read();
        dependency1.cleanCache();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(2);
      });
    });

    describe("when it returns another dependency", () => {
      it("should return the value of the dependency as dependency value", async () => {
        hasToThrow = FOO_ERROR;
        catchReturns = dependency2;
        const result = await selector.read();
        expect(result).toEqual(DEPENDENCY_2_RESULT);
      });

      it("should clean cache when returned dependency cache is clean", async () => {
        hasToThrow = FOO_ERROR;
        catchReturns = dependency2;
        selector.read();
        selector.read();
        await selector.read();
        dependency2.cleanCache();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(2);
      });

      it("should stop listening clean cache of returned dependency when original dependency stops throwing", async () => {
        hasToThrow = FOO_ERROR;
        catchReturns = dependency2;
        selector.read();
        selector.read();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(1);
        hasToThrow = null;
        dependency1.cleanCache();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(2);
        dependency2.cleanCache();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(2);
      });
    });

    describe("when it returns another dependency expressed as a function", () => {
      it("should return the value of the dependency as dependency value", async () => {
        hasToThrow = FOO_ERROR;
        catchReturns = () => dependency2;
        const result = await selector.read();
        expect(result).toEqual(DEPENDENCY_2_RESULT);
      });

      it("should clean cache when returned dependency cache is clean", async () => {
        hasToThrow = FOO_ERROR;
        catchReturns = () => dependency2;
        selector.read();
        selector.read();
        await selector.read();
        dependency2.cleanCache();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(2);
      });

      it("should stop listening clean cache of returned dependency when original dependency stops throwing", async () => {
        hasToThrow = FOO_ERROR;
        catchReturns = () => dependency2;
        selector.read();
        selector.read();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(1);
        hasToThrow = null;
        dependency1.cleanCache();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(2);
        dependency2.cleanCache();
        await selector.read();
        expect(selectorSpy.callCount).toEqual(2);
      });
    });
  });
});
