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

  describe("withot cleanCacheThrottle option", () => {
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
      provider.config({
        cleanCacheThrottle: 500,
      });
      await provider.read();
      provider.cleanCache(); // This one cleans the cache
      await provider.read();
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
      expect(spies.read.callCount).toEqual(2);
    });

    it("should clean cache one more time after throttle time if it receive calls while throttled", async () => {
      provider.config({
        cleanCacheThrottle: 500,
      });
      await provider.read();
      provider.cleanCache(); // This one cleans the cache
      await provider.read();
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
      provider.cleanCache(); // throttled
      await provider.read(); // from cache
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

    it("should emit cleanCacheEvent one more time after throttle time if it receive calls while throttled", async () => {
      provider.config({
        cleanCacheThrottle: 500,
      });
      provider.cleanCache(); // This one cleans the cache
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
      provider.cleanCache(); // throttled
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
