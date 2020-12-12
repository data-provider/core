/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");

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

describe("Selector cleanCacheThrottle option", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let selector;
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
    selector = new Selector(provider, (results) => results);
    selector.cleanDependenciesCache();
    provider.config({
      cleanCacheThrottle: null,
    });
    provider.on("cleanCache", cleanCacheEventListener);
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("without cleanCacheThrottle", () => {
    it("should execute read method of dependencies all times cleanCache is called", async () => {
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      expect(spies.read.callCount).toEqual(4);
    });
  });

  describe("with cleanCacheThrottle option", () => {
    it("should execute read method all times cleanCache is called if option value is 0", async () => {
      selector.config({
        cleanCacheThrottle: 0,
      });
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      expect(spies.read.callCount).toEqual(4);
    });

    it("should execute read method all times cleanCache is called if option value is null", async () => {
      selector.config({
        cleanCacheThrottle: null,
      });
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      selector.cleanDependenciesCache();
      await selector.read();
      expect(spies.read.callCount).toEqual(4);
    });

    it("should not clean cache again while it is throttled", async () => {
      expect.assertions(4);
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      expect(spies.read.callCount).toEqual(1);
      await selector.read();
      expect(spies.read.callCount).toEqual(2);
      selector.cleanDependenciesCache(); // throttled
      await selector.read(); // from cache
      expect(spies.read.callCount).toEqual(2);
      selector.cleanDependenciesCache(); // throttled
      await selector.read(); // from cache
      expect(spies.read.callCount).toEqual(2);
    });

    it("should clean cache one more time after throttle time if it receive calls while throttled", async () => {
      expect.assertions(4);
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      expect(spies.read.callCount).toEqual(1);
      await selector.read();
      expect(spies.read.callCount).toEqual(2);
      selector.cleanDependenciesCache(); // throttled
      await selector.read(); // from cache
      selector.cleanDependenciesCache(); // throttled
      await selector.read(); // from cache
      expect(spies.read.callCount).toEqual(2);
      await wait(700);
      // It should have cleaned cache again after throttle time
      await selector.read(); // from cache
      expect(spies.read.callCount).toEqual(3);
    });

    it("should emit cleanCache event all times cleanCache is called if option value is null", async () => {
      selector.config({
        cleanCacheThrottle: null,
      });
      await selector.read();
      selector.cleanDependenciesCache();
      selector.cleanDependenciesCache();
      selector.cleanDependenciesCache();
      expect(cleanCacheEventListener.callCount).toEqual(3);
    });

    it("should not emit cleanCache event again while it is throttled", async () => {
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
    });

    it("should emit cleanCache event if is called with force option even when it is throttled", async () => {
      expect.assertions(2);
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      selector.cleanDependenciesCache({ force: true }); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(2);
    });

    it("should emit cleanCache event if cleanCache is called in a dependency even when it is throttled", async () => {
      expect.assertions(2);
      const ownCleanCacheEventListener = sandbox.stub();
      selector.config({
        cleanCacheThrottle: 500,
      });
      selector.on("cleanCache", ownCleanCacheEventListener);
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      expect(ownCleanCacheEventListener.callCount).toEqual(1);
      await selector.read();
      provider.cleanCache(); // throttled
      expect(ownCleanCacheEventListener.callCount).toEqual(2);
    });

    it("should not emit any event more when finish throttle time after cleaning cache forced", async () => {
      expect.assertions(4);
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      selector.cleanDependenciesCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
      selector.cleanDependenciesCache({ force: true }); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(2);
      await wait(600);
      expect(cleanCacheEventListener.callCount).toEqual(2);
    });

    it("should reset throttle time when cleanCache is called with force option", async () => {
      expect.assertions(5);
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      selector.cleanDependenciesCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
      selector.cleanDependenciesCache({ force: true });
      expect(cleanCacheEventListener.callCount).toEqual(2);
      selector.cleanDependenciesCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(2);
      await wait(600);
      expect(cleanCacheEventListener.callCount).toEqual(3);
    });

    it("should emit cleanCacheEvent one more time after throttle time if it receive calls while throttled", async () => {
      expect.assertions(3);
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      selector.cleanDependenciesCache(); // This one cleans the cache
      expect(cleanCacheEventListener.callCount).toEqual(1);
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(1);
      await wait(700);
      expect(cleanCacheEventListener.callCount).toEqual(2);
    });

    it("should emit on cleanCache event maximum per throttle time", async () => {
      expect.assertions(7);
      selector.config({
        cleanCacheThrottle: 500,
      });
      await selector.read();
      var start = new Date();
      selector.cleanDependenciesCache(); // This one cleans the cache
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      logTime(start, "First block");
      expect(cleanCacheEventListener.callCount).toEqual(1);
      await wait(500);
      // Cleaned the cache on finish first throttle
      logTime(start, "After first wait");
      expect(cleanCacheEventListener.callCount).toEqual(2);
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      logTime(start, "After second block");
      expect(cleanCacheEventListener.callCount).toEqual(2);
      await wait(1500);
      // Cleaned the cache on finish second throttle
      logTime(start, "After second wait");
      expect(cleanCacheEventListener.callCount).toEqual(3);
      await wait(2000);
      // Do not cleans the cache more times as it is not called any more
      expect(cleanCacheEventListener.callCount).toEqual(3);
      selector.cleanDependenciesCache(); // not throttled
      expect(cleanCacheEventListener.callCount).toEqual(4);
      await wait(1000);
      // Do not cleans the cache more times as it is not called any more
      expect(cleanCacheEventListener.callCount).toEqual(4);
    }, 10000);

    it("should apply new throttleTime when config is called again", async () => {
      expect.assertions(7);
      selector.config({
        cleanCacheThrottle: 100,
      });
      await selector.read();
      var start = new Date();
      selector.cleanDependenciesCache(); // This one cleans the cache
      selector.cleanDependenciesCache(); // throttled
      logTime(start, "First block");
      expect(cleanCacheEventListener.callCount).toEqual(1);
      await wait(500);
      // Cleans the cache on finish first throttle
      logTime(start, "After first wait");
      expect(cleanCacheEventListener.callCount).toEqual(2);
      selector.config({
        cleanCacheThrottle: 2000,
      });
      selector.cleanDependenciesCache(); // Not throttled
      selector.cleanDependenciesCache(); // throttled
      selector.cleanDependenciesCache(); // throttled
      logTime(start, "After second block");
      expect(cleanCacheEventListener.callCount).toEqual(3);
      await wait(1500);
      // Still in throttle
      expect(cleanCacheEventListener.callCount).toEqual(3);
      selector.cleanDependenciesCache(); // throttled
      expect(cleanCacheEventListener.callCount).toEqual(3);
      await wait(2000);
      // Cleaned the cache on finish throttle
      expect(cleanCacheEventListener.callCount).toEqual(4);
      await wait(2000);
      // Do not cleaned the cache more times as it was not called any more
      expect(cleanCacheEventListener.callCount).toEqual(4);
    }, 10000);

    it("should do nothing when config is called whith same throttle value", async () => {
      selector.config({
        cleanCacheThrottle: 100,
      });
      await selector.read();
      const originalCleanCacheMethod = selector.cleanDependenciesCache;
      selector.config({
        cleanCacheThrottle: 100,
      });
      expect(selector.cleanDependenciesCache).toEqual(originalCleanCacheMethod);
    });

    it("should change throttledCleanCache method when throttle value is changed", async () => {
      selector.config({
        cleanCacheThrottle: 100,
      });
      await selector.read();
      const originalThrottledCleanCache = selector._throttledCleanDependenciesCache;
      selector.config({
        cleanCacheThrottle: 200,
      });
      expect(selector._throttledCleanDependenciesCache).not.toBe(originalThrottledCleanCache);
    });
  });
});
