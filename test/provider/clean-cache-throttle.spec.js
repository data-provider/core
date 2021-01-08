/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const logTime = (start, name) => {
  console.info(`${name || "Trace"} time: %dms`, new Date() - start);
};

describe("Provider cleanCacheThrottle option", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let provider;
  let cleanCacheEventListener;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    cleanCacheEventListener = sandbox.stub();

    spies = {
      read: sandbox.spy(),
    };

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve) => {
          spies.read();
          setTimeout(() => {
            resolve();
          }, 10);
        });
      }
    };

    provider = new TestProvider();
    provider.cleanCache();
    provider.on("cleanCache", cleanCacheEventListener);
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("without cleanCacheThrottle", () => {
    it("should execute read method all times cleanCache is called", async () => {
      await provider.read();
      provider.cleanCache();
      await provider.read();
      provider.cleanCache();
      await provider.read();
      provider.cleanCache();
      await provider.read();
      expect(spies.read.callCount).toEqual(4);
    });
  });

  describe("with cleanCacheThrottle option", () => {
    it("should execute read method all times cleanCache is called if option value is 0", async () => {
      provider.config({
        cleanCacheThrottle: 0,
      });
      await provider.read();
      provider.cleanCache();
      await provider.read();
      provider.cleanCache();
      await provider.read();
      provider.cleanCache();
      await provider.read();
      expect(spies.read.callCount).toEqual(4);
    });

    it("should execute read method all times cleanCache is called if option value is null", async () => {
      provider.config({
        cleanCacheThrottle: null,
      });
      await provider.read();
      provider.cleanCache();
      await provider.read();
      provider.cleanCache();
      await provider.read();
      provider.cleanCache();
      await provider.read();
      expect(spies.read.callCount).toEqual(4);
    });

    it("should not clean cache again while it is throttled", async () => {
      expect.assertions(3);
      provider.config({
        cleanCacheThrottle: 500,
      });
      await provider.read();
      provider.cleanCache(); // This one cleans the cache
      expect(spies.read.callCount).toEqual(1);
      await provider.read();
      expect(spies.read.callCount).toEqual(2);
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
      expect(spies.read.callCount).toEqual(2);
    });

    it("should pass same options to cleanCache method when it is throttled", async () => {
      expect.assertions(7);
      const options = { foo: "foo" };
      const originalUnthrottledCleanCache = provider._unthrottledCleanCache.bind(provider);
      provider._unthrottledCleanCache = function (opts) {
        originalUnthrottledCleanCache(opts);
      };
      const spy = sandbox.spy(provider, "_unthrottledCleanCache");
      provider.config({
        cleanCacheThrottle: 500,
      });
      sandbox.spy(provider, "_throttledCleanCache");
      await provider.read();
      provider.cleanCache(options); // This one cleans the cache
      expect(provider._throttledCleanCache.getCall(0).args[0]).toBe(options);
      expect(spy.getCall(0).args[0]).toBe(options);
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      expect(provider._throttledCleanCache.callCount).toEqual(3);
      expect(spy.callCount).toEqual(1);
      await wait(700);
      // It should have cleaned cache again after throttle time
      expect(provider._throttledCleanCache.callCount).toEqual(3);
      expect(spy.callCount).toEqual(2);
      expect(spy.getCall(1).args[0]).toBe(options);
    });

    it("should clean cache one more time after throttle time if it receive calls while throttled", async () => {
      expect.assertions(4);
      provider.config({
        cleanCacheThrottle: 500,
      });
      await provider.read();
      provider.cleanCache(); // This one cleans the cache
      expect(spies.read.callCount).toEqual(1);
      await provider.read();
      expect(spies.read.callCount).toEqual(2);
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
      expect(spies.read.callCount).toEqual(2);
      await wait(700);
      // It should have cleaned cache again after throttle time
      await provider.read(); // from cache
      expect(spies.read.callCount).toEqual(3);
    });

    it("should emit cleanCache event all times cleanCache is called if option value is null", async () => {
      provider.config({
        cleanCacheThrottle: null,
      });
      provider.cleanCache();
      provider.cleanCache();
      provider.cleanCache();
      expect(cleanCacheEventListener.callCount).toEqual(3);
    });

    it("should not emit cleanCache event again while it is throttled", async () => {
      provider.config({
        cleanCacheThrottle: 500,
      });
      provider.cleanCache(); // This one cleans the cache
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
    });

    it("should emit cleanCache event if is called with force option even when it is throttled", async () => {
      expect.assertions(2);
      provider.config({
        cleanCacheThrottle: 500,
      });
      provider.cleanCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      provider.cleanCache({ force: true }); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(2);
    });

    it("should emit cleanCache event if parent cleanCache is called with force option", async () => {
      expect.assertions(2);
      const childCleanCacheEventListener = sandbox.stub();
      const childProvider = provider.query({ foo: "foo" });
      childProvider.config({
        cleanCacheThrottle: 500,
      });
      childProvider.on("cleanCache", childCleanCacheEventListener);
      childProvider.cleanCache(); // This one cleans the cache
      expect(childCleanCacheEventListener.callCount).toEqual(1);
      provider.cleanCache({ force: true }); // throttled
      expect(childCleanCacheEventListener.callCount).toEqual(2);
    });

    it("should not emit any event more when finish throttle time after cleaning cache forced", async () => {
      expect.assertions(4);
      provider.config({
        cleanCacheThrottle: 500,
      });
      provider.cleanCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      provider.cleanCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
      provider.cleanCache({ force: true }); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(2);
      await wait(600);
      expect(cleanCacheEventListener.callCount).toEqual(2);
    });

    it("should reset throttle time when cleanCache is called with force option", async () => {
      expect.assertions(5);
      provider.config({
        cleanCacheThrottle: 500,
      });
      provider.cleanCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      provider.cleanCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
      provider.cleanCache({ force: true });
      expect(cleanCacheEventListener.callCount).toEqual(2);
      provider.cleanCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(2);
      await wait(600);
      expect(cleanCacheEventListener.callCount).toEqual(3);
    });

    it("should emit cleanCacheEvent one more time after throttle time if it receive calls while throttled", async () => {
      expect.assertions(3);
      provider.config({
        cleanCacheThrottle: 500,
      });
      provider.cleanCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
      await wait(700);
      expect(cleanCacheEventListener.callCount).toEqual(2);
    });

    it("should emit on cleanCache event maximum per throttle time", async () => {
      expect.assertions(7);
      provider.config({
        cleanCacheThrottle: 500,
      });
      var start = new Date();
      provider.cleanCache(); // This one cleans the cache
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      logTime(start, "First block");
      expect(cleanCacheEventListener.callCount).toEqual(1);
      await wait(500);
      // Cleaned the cache on finish first throttle
      logTime(start, "After first wait");
      expect(cleanCacheEventListener.callCount).toEqual(2);
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      logTime(start, "After second block");
      expect(cleanCacheEventListener.callCount).toEqual(2);
      await wait(1500);
      // Cleaned the cache on finish second throttle
      logTime(start, "After second wait");
      expect(cleanCacheEventListener.callCount).toEqual(3);
      await wait(2000);
      // Do not cleans the cache more times as it is not called any more
      expect(cleanCacheEventListener.callCount).toEqual(3);
      provider.cleanCache(); // not throttled
      expect(cleanCacheEventListener.callCount).toEqual(4);
      await wait(1000);
      // Do not cleans the cache more times as it is not called any more
      expect(cleanCacheEventListener.callCount).toEqual(4);
    }, 10000);

    it("should apply new throttleTime when config is called again", async () => {
      expect.assertions(7);
      provider.config({
        cleanCacheThrottle: 100,
      });
      var start = new Date();
      provider.cleanCache(); // This one cleans the cache
      provider.cleanCache(); // throttled
      logTime(start, "First block");
      expect(cleanCacheEventListener.callCount).toEqual(1);
      await wait(500);
      // Cleans the cache on finish first throttle
      logTime(start, "After first wait");
      expect(cleanCacheEventListener.callCount).toEqual(2);
      provider.config({
        cleanCacheThrottle: 2000,
      });
      provider.cleanCache(); // Not throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      logTime(start, "After second block");
      expect(cleanCacheEventListener.callCount).toEqual(3);
      await wait(1500);
      // Still in throttle
      expect(cleanCacheEventListener.callCount).toEqual(3);
      provider.cleanCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(3);
      await wait(2000);
      // Cleaned the cache on finish throttle
      expect(cleanCacheEventListener.callCount).toEqual(4);
      await wait(2000);
      // Do not cleaned the cache more times as it was not called any more
      expect(cleanCacheEventListener.callCount).toEqual(4);
    }, 10000);

    it("should do nothing when config is called whith same throttle value", () => {
      provider.config({
        cleanCacheThrottle: 100,
      });
      const originalCleanCacheMethod = provider.cleanCache;
      provider.config({
        cleanCacheThrottle: 100,
      });
      expect(provider.cleanCache).toEqual(originalCleanCacheMethod);
    });

    it("should change throttledCleanCache method when throttle value is changed", () => {
      provider.config({
        cleanCacheThrottle: 100,
      });
      const originalThrottledCleanCache = provider._throttledCleanCache;
      provider.config({
        cleanCacheThrottle: 200,
      });
      expect(provider._throttledCleanCache).not.toBe(originalThrottledCleanCache);
    });
  });
});
