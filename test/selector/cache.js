/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");

describe("Selector cache", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let provider;
  let selector;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    spies = {
      dependencyRead: sinon.spy(),
      selectorRead: sinon.spy()
    };

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve, reject) => {
          spies.dependencyRead(this.query);
          setTimeout(() => {
            if (!this.query.hasToThrow) {
              resolve("foo-read-result");
            } else {
              reject(new Error());
            }
          }, 50);
        });
      }
    };

    provider = new TestProvider();
    selector = new Selector(provider, testResult => {
      spies.selectorRead();
      return testResult;
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("without query", () => {
    it("should not execute read method more than once", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should not execute dependency read method again after cleanCache is called", async () => {
      expect.assertions(2);
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependencyRead.callCount).toEqual(1);
      selector.cleanCache();
      selector.read();
      await selector.read();
      await selector.read();
      expect(spies.dependencyRead.callCount).toEqual(1);
    });

    it("should execute read method again after cleanCache is called", async () => {
      expect.assertions(2);
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(1);
      selector.cleanCache();
      selector.read();
      await selector.read();
      await selector.read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });

  describe("with query", () => {
    it("should execute read method always for different queries", async () => {
      await selector.read();
      await selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo2" }).read();
      await selector.query({ foo: "foo3" }).read();
      expect(spies.selectorRead.callCount).toEqual(4);
    });

    it("should execute read only once for same query", async () => {
      selector.query({ foo: "foo" }).read();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should not execute dependency read method again when cache is clean for a query", async () => {
      expect.assertions(2);
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.dependencyRead.callCount).toEqual(1);
      selector.query({ foo: "foo" }).cleanCache();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.dependencyRead.callCount).toEqual(1);
    });

    it("should execute read method again when cache is clean for a query", async () => {
      expect.assertions(2);
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(1);
      selector.query({ foo: "foo" }).cleanCache();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should not execute dependency read method again when parent cache is clean", async () => {
      expect.assertions(2);
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.dependencyRead.callCount).toEqual(1);
      selector.cleanCache();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.dependencyRead.callCount).toEqual(1);
    });

    it("should execute read method again when parent cache is clean", async () => {
      expect.assertions(2);
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(1);
      selector.cleanCache();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should execute read method again when parent cache is a query, and it is clean", async () => {
      expect.assertions(2);
      selector
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      await selector
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      expect(spies.selectorRead.callCount).toEqual(1);
      selector.query({ var: "var" }).cleanCache();
      selector
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      await selector
        .query({ var: "var" })
        .query({ foo: "foo" })
        .read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });

  describe("with query applied to dependency", () => {
    beforeEach(() => {
      providers.clear();
      selector = new Selector(
        query => provider.query(query),
        testResult => {
          spies.selectorRead();
          return testResult;
        }
      );
    });

    it("should execute dependency read method always for different queries", async () => {
      await selector.read();
      await selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo2" }).read();
      await selector.query({ foo: "foo3" }).read();
      expect(spies.dependencyRead.callCount).toEqual(4);
    });

    it("should execute dependency read only once for same query", async () => {
      selector.query({ foo: "foo" }).read();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.dependencyRead.callCount).toEqual(1);
    });

    it("should not execute dependency read method again when cache is clean for a query", async () => {
      expect.assertions(2);
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.dependencyRead.callCount).toEqual(1);
      selector.query({ foo: "foo" }).cleanCache();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.dependencyRead.callCount).toEqual(1);
    });

    it("should execute read method again when cache is clean for a dependency with same query", async () => {
      expect.assertions(2);
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(1);
      provider.query({ foo: "foo" }).cleanCache();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(2);
    });

    it("should execute dependency and selector read method again when dependency parent cache is clean", async () => {
      expect.assertions(4);
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(1);
      expect(spies.dependencyRead.callCount).toEqual(1);
      provider.cleanCache();
      selector.query({ foo: "foo" }).read();
      await selector.query({ foo: "foo" }).read();
      expect(spies.selectorRead.callCount).toEqual(2);
      expect(spies.dependencyRead.callCount).toEqual(2);
    });
  });

  describe("when selector method throws an error", () => {
    beforeEach(() => {
      providers.clear();
      selector = new Selector(provider, () => {
        spies.selectorRead();
        throw new Error();
      });
    });

    it("should clean cache", async () => {
      selector.read().catch(() => {});
      selector.read().catch(() => {});
      selector.read().catch(() => {});
      await selector.read().catch(() => {});
      await selector.read().catch(() => {});
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });
});
