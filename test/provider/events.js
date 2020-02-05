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

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    TestProvider = class extends Provider {
      readMethod(data) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(data);
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
      provider.on("readStart", spy);
      await provider.read();
      provider.cleanCache();
      await provider.read();
      expect(spy.callCount).toEqual(2);
    });

    it("should remove listener when returned function is executed", async () => {
      const spy = sandbox.spy();
      const removeListener = provider.on("readStart", spy);
      await provider.read();
      provider.cleanCache();
      removeListener();
      await provider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should execute listener only once when listener was added with once", async () => {
      const spy = sandbox.spy();
      provider.once("readStart", spy);
      await provider.read();
      provider.cleanCache();
      await provider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should remove listener when returned function is executed and listener was added with once", async () => {
      const spy = sandbox.spy();
      const removeListener = provider.once("readStart", spy);
      removeListener();
      await provider.read();
      expect(spy.callCount).toEqual(0);
    });

    it("should execute child listener every time child event is emitted", async () => {
      const spy = sandbox.spy();
      provider.onChild("readStart", spy);
      await childProvider.read();
      childProvider.cleanCache();
      await childProvider.read();
      expect(spy.callCount).toEqual(2);
    });

    it("should remove child listener when returned function is executed", async () => {
      const spy = sandbox.spy();
      const removeListener = provider.onChild("readStart", spy);
      await childProvider.read();
      provider.cleanCache();
      removeListener();
      await childProvider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should execute listener only once when child listener was added with once", async () => {
      const spy = sandbox.spy();
      provider.onceChild("readStart", spy);
      await childProvider.read();
      childProvider.cleanCache();
      await childProvider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should remove child listener when returned function is executed and listener was added with once", async () => {
      const spy = sandbox.spy();
      const removeListener = provider.onceChild("readStart", spy);
      removeListener();
      await childProvider.read();
      expect(spy.callCount).toEqual(0);
    });
  });

  describe("listener arguments", () => {
    it("should pass previous store to listener as second argument", async () => {
      const spy = sandbox.spy();
      const prevStore = provider.store;
      provider.on("readStart", spy);
      await provider.read();
      expect(spy.getCall(0).args[0]).toEqual(prevStore);
    });

    it("should pass previous state to event when listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      const prevStore = provider.store;
      provider.on("*", spy);
      await provider.read();
      expect(spy.getCall(0).args[1]).toEqual(prevStore);
    });

    it("should pass child previous store to child listener as second argument", async () => {
      const spy = sandbox.spy();
      const prevStore = childProvider.store;
      provider.onChild("readStart", spy);
      await childProvider.read();
      expect(spy.getCall(0).args[0]).toEqual(prevStore);
    });

    it("should pass event name to child listener as first argument when child listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      provider.onChild("*", spy);
      await childProvider.read();
      expect(spy.getCall(0).args[0]).toEqual("readStart");
    });

    it("should pass previous store to child listener as first argument when child listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      const prevStore = childProvider.store;
      provider.onChild("*", spy);
      await childProvider.read();
      expect(spy.getCall(0).args[1]).toEqual(prevStore);
    });
  });

  describe("readStart event", () => {
    it("should emit a readStart event when provider starts read method", async () => {
      const spy = sandbox.spy();
      provider.on("readStart", spy);
      await provider.read();
      expect(spy.callCount).toEqual(1);
    });

    it("should emit a readStart event when listener is added with wildcard", async () => {
      const spy = sandbox.spy();
      provider.on("*", spy);
      await provider.read();
      expect(spy.getCall(0).args[0]).toEqual("readStart");
    });

    it("should emit a child readStart event when child starts read method", async () => {
      const spy = sandbox.spy();
      provider.onChild("readStart", spy);
      await childProvider.read();
      expect(spy.callCount).toEqual(1);
    });
  });
});
