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

describe("Provider cleanCacheInterval option", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let provider;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    spies = {
      read: sinon.spy(),
    };

    TestProvider = class extends Provider {
      readMethod(hasToThrow) {
        return new Promise((resolve, reject) => {
          spies.read(this.query);
          setTimeout(() => {
            if (!hasToThrow) {
              resolve("foo-read-result");
            } else {
              reject(new Error());
            }
          }, 50);
        });
      }
    };

    provider = new TestProvider();
  });

  afterEach(() => {
    sandbox.restore();
    provider.config({
      cleanCacheInterval: null,
    });
    providers.clear();
  });

  describe("without cleanCacheInterval", () => {
    it("should not execute read method more than once", async () => {
      provider.read();
      provider.read();
      provider.read();
      await provider.read();
      expect(spies.read.callCount).toEqual(1);
    });
  });

  describe("reading many times before cleanCacheInterval", () => {
    it("should not execute read method more than once", async () => {
      provider.config({
        cleanCacheInterval: 1000,
      });
      provider.read();
      provider.read();
      provider.read();
      await provider.read();
      expect(spies.read.callCount).toEqual(1);
    });
  });

  describe("reading many times after cleanCacheInterval", () => {
    it("should execute read every times", async () => {
      provider.config({
        cleanCacheInterval: 200,
      });
      provider.read();
      await wait(300);
      provider.read();
      await wait(300);
      provider.read();
      await wait(300);
      await provider.read();
      expect(spies.read.callCount).toEqual(4);
    });
  });

  describe("when cleanCache is called manually", () => {
    it("should reset cleanCacheInterval", async () => {
      provider.config({
        cleanCacheInterval: 500,
      });
      provider.read();
      await wait(400);
      provider.cleanCache();
      provider.read();
      await wait(400);
      expect(provider._cache).not.toEqual(null);
    });
  });

  describe("when config method is called multiple times", () => {
    it("should not reset interval in no cleanCacheInterval is defined", async () => {
      provider.config({
        cleanCacheInterval: 500,
      });
      await wait(300);
      provider.config({});
      provider.read();
      await wait(300);
      provider.read();
      expect(spies.read.callCount).toEqual(2);
    });

    it("should reset interval in cleanCacheInterval is defined again", async () => {
      provider.config({
        cleanCacheInterval: 500,
      });
      await wait(300);
      provider.read();
      provider.config({
        cleanCacheInterval: 1000,
      });
      await wait(300);
      provider.read();
      expect(spies.read.callCount).toEqual(1);
    });

    it("should clean interval if it is set to null", async () => {
      provider.config({
        cleanCacheInterval: 200,
      });
      provider.read();
      await wait(300);
      provider.read();
      provider.config({
        cleanCacheInterval: null,
      });
      await wait(300);
      provider.read();
      await wait(300);
      await provider.read();
      expect(spies.read.callCount).toEqual(2);
    });
  });
});
