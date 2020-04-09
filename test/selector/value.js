/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, Selector } = require("../../src/index");

describe("Selector value", () => {
  const DEPENDENCY_1_RESULT = "dependency-1-result";
  const DEPENDENCY_2_RESULT = "dependency-2-result";
  const DEPENDENCY_3_RESULT = "dependency-3-result";
  let sandbox;
  let selector;
  let TestProvider;
  let dependency1;
  let dependency2;
  let dependency3;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!this.query.hasToThrow) {
              resolve(this.options.return);
            } else {
              reject(new Error());
            }
          }, 50);
        });
      }
    };

    dependency1 = new TestProvider("dependency-1", {
      return: DEPENDENCY_1_RESULT,
    });
    dependency2 = new TestProvider("dependency-2", {
      return: DEPENDENCY_2_RESULT,
    });
    dependency3 = new TestProvider("dependency-3", {
      return: DEPENDENCY_3_RESULT,
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when defining default value", () => {
    const RESULT = "foo";
    beforeEach(() => {
      selector = new Selector(
        dependency1,
        () => {
          return RESULT;
        },
        {
          initialState: {
            data: "foo",
          },
        }
      );
    });

    it("should have initialState in initial state", async () => {
      expect(selector.state.data).toEqual("foo");
    });
  });

  describe("when returning a value", () => {
    const RESULT = "foo";
    beforeEach(() => {
      selector = new Selector(dependency1, () => {
        return RESULT;
      });
    });

    it("should return the value in read method", async () => {
      const result = await selector.read();
      expect(result).toEqual(RESULT);
    });
  });

  describe("when returning null", () => {
    beforeEach(() => {
      selector = new Selector(dependency1, () => {
        return null;
      });
    });

    it("should return null in read method", async () => {
      const result = await selector.read();
      expect(result).toEqual(null);
    });
  });

  describe("when returning a promise", () => {
    const RESULT = "foo";
    beforeEach(() => {
      selector = new Selector(dependency1, () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(RESULT);
          }, 20);
        });
      });
    });

    it("should return the value in read method", async () => {
      const result = await selector.read();
      expect(result).toEqual(RESULT);
    });
  });

  describe("when returning another provider", () => {
    describe("expressed as a provider instance", () => {
      beforeEach(() => {
        selector = new Selector(dependency1, () => {
          return dependency2;
        });
      });

      it("should return the value returned by the read method of the dependency", async () => {
        const result = await selector.read();
        expect(result).toEqual(DEPENDENCY_2_RESULT);
      });
    });

    describe("expressed as an array of provider instances", () => {
      beforeEach(() => {
        selector = new Selector(dependency1, () => {
          return [dependency2, dependency3];
        });
      });

      it("should return an array containing values returned by the read method of the dependencies", async () => {
        const result = await selector.read();
        expect(result).toEqual([DEPENDENCY_2_RESULT, DEPENDENCY_3_RESULT]);
      });
    });

    describe("expressed a function returning a provider", () => {
      let querySpy;
      beforeEach(() => {
        querySpy = sandbox.spy();
        selector = new Selector(dependency1, () => {
          return (query) => {
            querySpy(query);
            return dependency2;
          };
        });
      });

      it("should return the value returned by the read method of the dependency", async () => {
        const result = await selector.read();
        expect(result).toEqual(DEPENDENCY_2_RESULT);
      });

      it("should receive query in the function", async () => {
        const QUERY = { foo: "foo" };
        await selector.query(QUERY).read();
        expect(querySpy.getCall(0).args[0]).toEqual(QUERY);
      });
    });

    describe("expressed an array of functions returning providers", () => {
      let query1Spy;
      let query2Spy;
      beforeEach(() => {
        query1Spy = sandbox.spy();
        query2Spy = sandbox.spy();
        selector = new Selector(dependency1, () => {
          return [
            (query) => {
              query1Spy(query);
              return dependency2;
            },
            (query) => {
              query2Spy(query);
              return dependency3;
            },
          ];
        });
      });

      it("should return an array containing values returned by the read method of the dependencies", async () => {
        const result = await selector.read();
        expect(result).toEqual([DEPENDENCY_2_RESULT, DEPENDENCY_3_RESULT]);
      });

      it("should receive query in the functions", async () => {
        const QUERY = { foo: "foo" };
        await selector.query(QUERY).read();
        expect(query1Spy.getCall(0).args[0]).toEqual(QUERY);
        expect(query2Spy.getCall(0).args[0]).toEqual(QUERY);
      });
    });

    // TODO, test returning catchDependency
  });

  describe("when returning a function returning a result", () => {
    beforeEach(() => {
      selector = new Selector(dependency1, () => {
        return () => "foo";
      });
    });

    it("should resolve with result", async () => {
      expect.assertions(1);
      const data = await selector.read();
      expect(data).toEqual("foo");
    });
  });

  describe("when returning an error", () => {
    const FOO_ERROR = new Error("Foo");
    beforeEach(() => {
      selector = new Selector(dependency1, () => {
        throw FOO_ERROR;
      });
    });

    it("should reject with received error", async () => {
      expect.assertions(1);
      try {
        await selector.read();
      } catch (error) {
        expect(error).toEqual(FOO_ERROR);
      }
    });

    it("should be able to catch error in promise", async () => {
      expect.assertions(1);
      await selector.read().catch((error) => {
        expect(error).toEqual(FOO_ERROR);
      });
    });
  });
});
