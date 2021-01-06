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

describe("Provider cacheTime option", () => {
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
    providers.clear();
  });

  describe("without cacheTime", () => {
    it("should not execute read method more than once", async () => {
      provider.read();
      provider.read();
      provider.read();
      await provider.read();
      expect(spies.read.callCount).toEqual(1);
    });
  });

  describe("reading many times before cacheTime", () => {
    it("should not execute read method more than once", async () => {
      provider.config({
        cacheTime: 1000,
      });
      provider.read();
      provider.read();
      provider.read();
      await provider.read();
      expect(spies.read.callCount).toEqual(1);
    });
  });

  describe("reading many times after cacheTime", () => {
    it("should execute read every times", async () => {
      provider.config({
        cacheTime: 200,
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
    it("should not clean cache automatically", async () => {
      provider.config({
        cacheTime: 500,
      });
      provider.read();
      await wait(400);
      provider.cleanCache();
      provider.read();
      await wait(400);
      expect(provider._cache).not.toEqual(null);
    });
  });
});
