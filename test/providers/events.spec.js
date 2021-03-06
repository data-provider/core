/*
Copyright 2020 Javier Brea
Copyright 2019 XByOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("Provider events", () => {
  let sandbox;
  let TestProvider;
  let provider;
  let childProvider;
  let hasToThrow;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    TestProvider = class extends Provider {
      readMethod(data) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!hasToThrow) {
              resolve(data);
            } else {
              reject(hasToThrow);
            }
          }, 100);
        });
      }
    };
    provider = new TestProvider();
    childProvider = provider.query({ foo: "foo" });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("listener", () => {
    it("should execute listener every time event is emitted", async () => {
      const spy = sandbox.spy();
      providers.on("readStart", spy);
      await provider.read();
      provider.cleanCache();
      await provider.read();
      expect(spy.callCount).toEqual(2);
    });

    it("should remove listener when returned function is executed", async () => {
      const spy = sandbox.spy();
      const removeListener = providers.on("readStart", spy);
      await provider.read();
      provider.cleanCache();
      removeListener();
      await provider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should execute listener only once when listener was added with once", async () => {
      const spy = sandbox.spy();
      providers.once("readStart", spy);
      await provider.read();
      provider.cleanCache();
      await provider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should remove listener when returned function is executed and listener was added with once", async () => {
      const spy = sandbox.spy();
      const removeListener = providers.once("readStart", spy);
      removeListener();
      await provider.read();
      expect(spy.callCount).toEqual(0);
    });

    it("should execute child listener every time child event is emitted", async () => {
      const spy = sandbox.spy();
      providers.onChild("readStart", spy);
      await childProvider.read();
      childProvider.cleanCache();
      await childProvider.read();
      expect(spy.callCount).toEqual(2);
    });

    it("should remove child listener when returned function is executed", async () => {
      const spy = sandbox.spy();
      const removeListener = providers.onChild("readStart", spy);
      await childProvider.read();
      provider.cleanCache();
      removeListener();
      await childProvider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should execute listener only once when child listener was added with once", async () => {
      const spy = sandbox.spy();
      providers.onceChild("readStart", spy);
      await childProvider.read();
      childProvider.cleanCache();
      await childProvider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should remove child listener when returned function is executed and listener was added with once", async () => {
      const spy = sandbox.spy();
      const removeListener = providers.onceChild("readStart", spy);
      removeListener();
      await childProvider.read();
      expect(spy.callCount).toEqual(0);
    });
  });

  describe("listener arguments", () => {
    it("should pass event name to child listener as first argument when child listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      providers.onChild("*", spy);
      await childProvider.read();
      expect(spy.getCall(0).args[0]).toEqual("readStart");
    });
  });

  describe("readStart event", () => {
    it("should emit a readStart event when provider starts read method", async () => {
      const spy = sandbox.spy();
      providers.on("readStart", spy);
      await provider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should emit a readStart event when listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      providers.on("*", spy);
      await provider.read();
      expect(spy.getCall(0).args[0]).toEqual("readStart");
    });

    it("should emit a child readStart event when child starts read method", async () => {
      const spy = sandbox.spy();
      providers.onChild("readStart", spy);
      await childProvider.read();
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("readSuccess event", () => {
    it("should emit a readSuccess event when provider finish read method", async () => {
      const spy = sandbox.spy();
      providers.on("readSuccess", spy);
      await provider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should emit a readSuccess event when listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      providers.on("*", spy);
      await provider.read();
      expect(spy.getCall(1).args[0]).toEqual("readSuccess");
    });

    it("should emit a child readStart event when child finish read method", async () => {
      const spy = sandbox.spy();
      providers.onChild("readSuccess", spy);
      await childProvider.read();
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("readError event", () => {
    beforeEach(() => {
      hasToThrow = new Error();
    });

    it("should emit a readError event when provider throws in read method", async () => {
      const spy = sandbox.spy();
      providers.on("readError", spy);
      try {
        await provider.read();
      } catch (err) {}
      expect(spy.callCount).toEqual(1);
    });

    it("should emit a readError event when listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      providers.on("*", spy);
      try {
        await provider.read();
      } catch (err) {}
      expect(spy.getCall(1).args[0]).toEqual("readError");
    });

    it("should emit a child readError event when child finish read method", async () => {
      const spy = sandbox.spy();
      providers.onChild("readError", spy);
      try {
        await childProvider.read();
      } catch (err) {}
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("cleanCache event", () => {
    beforeEach(() => {
      hasToThrow = new Error();
    });

    it("should emit a cleanCache event when providers cache is clean", async () => {
      const spy = sandbox.spy();
      providers.on("cleanCache", spy);
      provider.cleanCache();
      expect(spy.callCount).toEqual(2);
    });

    it("should emit a cleanCache event when listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      providers.on("*", spy);
      provider.cleanCache();
      expect(spy.getCall(0).args[0]).toEqual("cleanCache");
    });

    it("should emit a child cleanCache event when child cache is clean", async () => {
      const spy = sandbox.spy();
      providers.onChild("cleanCache", spy);
      childProvider.cleanCache();
      expect(spy.callCount).toEqual(1);
    });

    it("should emit a child cleanCache event when parent cache is clean", async () => {
      const spy = sandbox.spy();
      providers.onChild("cleanCache", spy);
      provider.cleanCache();
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("resetState event", () => {
    beforeEach(() => {
      hasToThrow = new Error();
    });

    it("should emit a resetState event when providers resetState is called", async () => {
      const spy = sandbox.spy();
      providers.on("resetState", spy);
      provider.resetState();
      expect(spy.callCount).toEqual(2);
    });

    it("should emit a resetState event when listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      providers.on("*", spy);
      provider.resetState();
      expect(spy.getCall(0).args[0]).toEqual("resetState");
    });

    it("should emit a child resetState event when child resetState is called", async () => {
      const spy = sandbox.spy();
      providers.onChild("resetState", spy);
      childProvider.resetState();
      expect(spy.callCount).toEqual(1);
    });

    it("should emit a child resetState event when parent resetState is called", async () => {
      const spy = sandbox.spy();
      providers.onChild("resetState", spy);
      provider.resetState();
      expect(spy.callCount).toEqual(1);
    });
  });
});
