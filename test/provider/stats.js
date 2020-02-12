/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("Provider stats", () => {
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

    provider = new TestProvider();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when read has not been called", () => {
    it("should be empty", () => {
      expect(provider.stats).toEqual({
        actions: {
          cleanCache: 0,
          init: 1,
          readStart: 0,
          readSuccess: 0,
          readError: 0,
          resetState: 0
        }
      });
    });
  });

  describe("when read is called", () => {
    it("should increase only 1 readStart for cached reads", async () => {
      expect.assertions(2);
      provider.read();
      provider.read();
      provider.read();
      expect(provider.stats.actions.readStart).toEqual(1);
      await provider.read();
      expect(provider.stats.actions.readStart).toEqual(1);
    });

    it("should increase only 1 readSuccess for cached reads", async () => {
      provider.read();
      provider.read();
      provider.read();
      await provider.read();
      expect(provider.stats.actions.readSuccess).toEqual(1);
    });
  });

  describe("when read throws an error", () => {
    it("should increase only 1 readError for cached reads", async () => {
      const error = new Error("foo error message");
      results.throwError = error;
      provider.read().catch(() => {});
      provider.read().catch(() => {});
      provider.read().catch(() => {});
      provider.read().catch(() => {});
      await provider.read().catch(() => {});
      expect(provider.stats.actions.readError).toEqual(1);
    });
  });

  describe("when resetState is called", () => {
    it("should increase 1 resetState action", async () => {
      provider.resetState();
      expect(provider.stats.actions.resetState).toEqual(1);
    });
  });

  describe("when cleanCache is called", () => {
    it("should increase 1 cleanCache action", async () => {
      provider.cleanCache();
      expect(provider.stats.actions.cleanCache).toEqual(1);
    });
  });

  describe("when cleanCache is called and provider has children", () => {
    it("should increase 1 cleanCache action in all children", async () => {
      expect.assertions(4);
      const child = provider.query({ foo: "foo" });
      const grandChild = child.query({ var: "var" });
      expect(grandChild.stats.actions.cleanCache).toEqual(0);
      expect(child.stats.actions.cleanCache).toEqual(0);
      provider.cleanCache();
      expect(grandChild.stats.actions.cleanCache).toEqual(1);
      expect(child.stats.actions.cleanCache).toEqual(1);
    });
  });

  describe("when resetStats is called", () => {
    it("should return stats to initial state", async () => {
      expect.assertions(2);
      await provider.read();
      expect(provider.stats.actions.readSuccess).toEqual(1);
      provider.resetStats();
      expect(provider.stats).toEqual({
        actions: {
          cleanCache: 0,
          init: 1,
          readStart: 0,
          readSuccess: 0,
          readError: 0,
          resetState: 0
        }
      });
    });
  });

  describe("when resetStats is called and provider has childs", () => {
    it("should return stats of all childs to initial state", async () => {
      expect.assertions(4);
      const child = provider.query({ foo: "foo" });
      const grandChild = child.query({ var: "var" });
      await grandChild.read();
      await child.read();
      expect(grandChild.stats.actions.readSuccess).toEqual(1);
      expect(child.stats.actions.readSuccess).toEqual(1);
      provider.resetStats();
      expect(grandChild.stats.actions.readSuccess).toEqual(0);
      expect(child.stats.actions.readSuccess).toEqual(0);
    });
  });
});
