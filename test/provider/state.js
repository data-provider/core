/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("Provider state", () => {
  let sandbox;
  let spies;
  let results;
  let TestProvider;
  let provider;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    spies = {
      read: sinon.spy()
    };
    results = {
      throwError: null,
      returnData: null
    };

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve, reject) => {
          spies.read(this.queryValue);
          setTimeout(() => {
            if (!results.throwError) {
              resolve(results.returnData);
            } else {
              reject(results.throwError);
            }
          }, 50);
        });
      }
    };

    provider = new TestProvider("foo-id", {
      initialState: {
        data: "foo"
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when read has not been called", () => {
    it("should return initialState in data property", () => {
      expect(provider.state.data).toEqual("foo");
    });

    it("should return null in error property", () => {
      expect(provider.state.error).toEqual(null);
    });

    it("should return false in loading property", () => {
      expect(provider.state.error).toEqual(null);
    });
  });

  describe("when read is called", () => {
    it("should return true in loading property until it finish loading", async () => {
      expect.assertions(2);
      provider.read();
      expect(provider.state.loading).toEqual(true);
      await provider.read();
      expect(provider.state.loading).toEqual(false);
    });

    it("should return data in read promise", async () => {
      results.returnData = "foo2";
      const data = await provider.read();
      expect(data).toEqual("foo2");
    });

    it("should return data in data property when it finish loading", async () => {
      results.returnData = "foo2";
      await provider.read();
      expect(provider.state.data).toEqual("foo2");
    });

    it("should maintain data when cleanCache is called", async () => {
      expect.assertions(2);
      results.returnData = "foo2";
      await provider.read();
      expect(provider.state.data).toEqual("foo2");
      provider.cleanCache();
      expect(provider.state.data).toEqual("foo2");
    });

    it("should return different states for different queries", async () => {
      expect.assertions(2);
      results.returnData = "foo2";
      const testProvider = provider.query({
        foo: "foo"
      });
      await testProvider.read();
      expect(testProvider.state.data).toEqual("foo2");
      expect(provider.state.data).toEqual("foo");
    });
  });

  describe("when read throws an error", () => {
    it("should return null in error property until it finish loading", async () => {
      expect.assertions(2);
      const error = new Error("foo error message");
      results.throwError = error;
      provider.read().catch(() => {});
      expect(provider.state.error).toEqual(null);
      await provider.read().catch(() => {});
      expect(provider.state.error).toBe(error);
    });

    it("should return null in error property after read returns data again", async () => {
      expect.assertions(3);
      const error = new Error("foo error message");
      results.throwError = error;
      provider.read().catch(() => {});
      expect(provider.state.error).toEqual(null);
      await provider.read().catch(() => {});
      expect(provider.state.error).toBe(error);
      results.throwError = null;
      results.returnData = "foo";
      await provider.read();
      expect(provider.state.error).toEqual(null);
    });
  });

  describe("when resetState is called", () => {
    it("should reset state to initialState", async () => {
      expect.assertions(2);
      results.returnData = "foo2";
      await provider.read();
      expect(provider.state.data).toEqual("foo2");
      provider.resetState();
      expect(provider.state.data).toEqual("foo");
    });

    it("should reset error state to null if no error was defined in initialState", async () => {
      expect.assertions(2);
      const error = new Error("foo error message");
      results.throwError = error;
      await provider.read().catch(() => {});
      expect(provider.state.error).toBe(error);
      provider.resetState();
      expect(provider.state.error).toEqual(null);
    });

    it("should reset loading state to false if no loading was defined in initialState", async () => {
      expect.assertions(3);
      results.returnData = "foo2";
      provider.read();
      expect(provider.state.loading).toEqual(true);
      provider.resetState();
      expect(provider.state.loading).toEqual(false);
      await provider.read();
      expect(provider.state.loading).toEqual(false);
    });

    it("should reset data to initialState of all childs providers", async () => {
      expect.assertions(6);
      const provider2 = provider.query({ foo: "foo" });
      const provider3 = provider2.query({ foo2: "foo2" });
      results.returnData = "foo2";
      await provider.read();
      await provider2.read();
      await provider3.read();
      expect(provider.state.data).toEqual("foo2");
      expect(provider2.state.data).toEqual("foo2");
      expect(provider3.state.data).toEqual("foo2");
      provider.resetState();
      expect(provider.state.data).toEqual("foo");
      expect(provider2.state.data).toEqual("foo");
      expect(provider3.state.data).toEqual("foo");
    });
  });

  describe("when initialState also defines error and loading properties", () => {
    const error = new Error();
    beforeEach(() => {
      provider = new TestProvider("foo-id-2", {
        initialState: {
          data: "foo",
          error,
          loading: true
        }
      });
    });

    it("should reset state to initialState", async () => {
      expect.assertions(6);
      results.returnData = "foo2";
      await provider.read();
      expect(provider.state.error).toEqual(null);
      expect(provider.state.loading).toEqual(false);
      expect(provider.state.data).toEqual("foo2");
      provider.resetState();
      expect(provider.state.error).toEqual(error);
      expect(provider.state.loading).toEqual(true);
      expect(provider.state.data).toEqual("foo");
    });
  });

  describe("when initialState is a callback", () => {
    it("should return initialState result based in current query value", () => {
      expect.assertions(2);
      provider = new TestProvider("foo-id-2", {
        initialState: query => ({ data: query })
      });
      expect(provider.state.data).toEqual({});
      expect(provider.query({ foo: "foo" }).state.data).toEqual({ foo: "foo" });
    });

    it("should return undefined in state when function returns undefined", () => {
      expect.assertions(2);
      provider = new TestProvider("foo-id-2", {
        initialState: () => {}
      });
      expect(provider.state.data).toEqual(undefined);
      expect(provider.query({ foo: "foo" }).state.data).toEqual(undefined);
    });
  });

  describe("when initialState is not provided", () => {
    it("should return undefined in data state", () => {
      provider = new TestProvider("foo-id-2");
      expect(provider.state.data).toEqual(undefined);
    });
  });

  describe("when custom initialState getter is defined", () => {
    let TestProvider2;
    beforeEach(() => {
      TestProvider2 = class extends TestProvider {
        get initialState() {
          if (this.queryValue) {
            return {
              ...this.initialStateFromOptions,
              data: this.initialStateFromOptions.data[this.queryValue.key]
            };
          }
          return this.initialStateFromOptions;
        }
      };
    });

    it("should return undefined in data state", async () => {
      provider = new TestProvider2("foo-id-2", {
        initialState: {
          data: {
            foo: "foo"
          }
        }
      });
      const child = provider.query({ key: "foo" });
      expect(child.state.data).toEqual("foo");
    });
  });
});
