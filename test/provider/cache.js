/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("Provider cache", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let testProvider;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    spies = {
      read: sinon.spy()
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

    testProvider = new TestProvider();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("without query", () => {
    it("should not execute read method more than once", async () => {
      testProvider.read();
      testProvider.read();
      testProvider.read();
      await testProvider.read();
      expect(spies.read.callCount).toEqual(1);
    });

    it("should execute read method again after cleanCache is called", async () => {
      expect.assertions(2);
      testProvider.read();
      testProvider.read();
      testProvider.read();
      await testProvider.read();
      expect(spies.read.callCount).toEqual(1);
      testProvider.cleanCache();
      testProvider.read();
      await testProvider.read();
      await testProvider.read();
      expect(spies.read.callCount).toEqual(2);
    });

    it("should clean cache when read method throws error", async () => {
      testProvider.read(true).catch(() => {});
      testProvider.read(true).catch(() => {});
      testProvider.read(true).catch(() => {});
      await testProvider.read(true).catch(() => {});
      await testProvider.read(true).catch(() => {});
      expect(spies.read.callCount).toEqual(2);
    });
  });

  describe("with query", () => {
    it("should execute read method always for different queries", async () => {
      await testProvider.read();
      await testProvider.query({ foo: "foo" }).read();
      await testProvider.query({ foo: "foo2" }).read();
      await testProvider.query({ foo: "foo3" }).read();
      expect(spies.read.callCount).toEqual(4);
    });

    it("should execute read only once for same query", async () => {
      testProvider.query({ foo: "foo" }).read();
      testProvider.query({ foo: "foo" }).read();
      await testProvider.query({ foo: "foo" }).read();
      await testProvider.query({ foo: "foo" }).read();
      expect(spies.read.callCount).toEqual(1);
    });

    it("should execute read method again when cache is clean for a query", async () => {
      expect.assertions(2);
      testProvider.query({ foo: "foo" }).read();
      await testProvider.query({ foo: "foo" }).read();
      expect(spies.read.callCount).toEqual(1);
      testProvider.query({ foo: "foo" }).cleanCache();
      testProvider.query({ foo: "foo" }).read();
      await testProvider.query({ foo: "foo" }).read();
      expect(spies.read.callCount).toEqual(2);
    });

    it("should execute read method again when parent cache is clean", async () => {
      expect.assertions(2);
      testProvider.query({ foo: "foo" }).read();
      await testProvider.query({ foo: "foo" }).read();
      expect(spies.read.callCount).toEqual(1);
      testProvider.cleanCache();
      testProvider.query({ foo: "foo" }).read();
      await testProvider.query({ foo: "foo" }).read();
      expect(spies.read.callCount).toEqual(2);
    });

    it("should execute read method again when parent cache is a query, and it is clean", async () => {
      expect.assertions(2);
      testProvider
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      await testProvider
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      expect(spies.read.callCount).toEqual(1);
      testProvider.query({ var: "var" }).cleanCache();
      testProvider
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      await testProvider
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      expect(spies.read.callCount).toEqual(2);
    });
  });
});
