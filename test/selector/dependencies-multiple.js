/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");

describe("Selector with multiple dependencies", () => {
  let sandbox;
  let spies;
  let TestProvider;
  let dependency1;
  let dependency2;
  let dependency3;
  let dependency4;
  let dependency5;
  let dependency6;
  let dependency7;
  let dependency8;
  let dependency9;
  let dependency10;
  let dependency11;
  let dependency12;
  let dependency13;
  let dependency14;
  let dependency15;
  let dependency16;
  let selector;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    spies = {
      dependency1Read: sinon.spy(),
      dependency2Read: sinon.spy(),
      dependency3Read: sinon.spy(),
      dependency4Read: sinon.spy(),
      dependency5Read: sinon.spy(),
      dependency6Read: sinon.spy(),
      dependency7Read: sinon.spy(),
      dependency8Read: sinon.spy(),
      dependency9Read: sinon.spy(),
      dependency10Read: sinon.spy(),
      dependency11Read: sinon.spy(),
      dependency12Read: sinon.spy(),
      dependency13Read: sinon.spy(),
      dependency14Read: sinon.spy(),
      dependency15Read: sinon.spy(),
      dependency16Read: sinon.spy(),
      selectorRead: sinon.spy()
    };

    TestProvider = class extends Provider {
      readMethod() {
        return new Promise((resolve, reject) => {
          this.options.spy(this.query);
          setTimeout(() => {
            if (!this.queryValue.hasToThrow) {
              resolve("foo-read-result");
            } else {
              reject(new Error());
            }
          }, 50);
        });
      }
    };

    dependency1 = new TestProvider("provider-1", {
      spy: spies.dependency1Read
    });
    dependency2 = new TestProvider("provider-2", {
      spy: spies.dependency2Read
    });

    dependency3 = new Selector(dependency1, testResult => {
      spies.dependency3Read();
      return testResult;
    });

    dependency4 = new Selector(
      [dependency2, dependency3],
      ([provider2Results, selectorResults]) => {
        spies.dependency4Read();
        return Promise.resolve({
          provider2Results,
          selectorResults
        });
      }
    );

    dependency5 = new Selector(
      {
        provider: dependency4,
        query: query => query
      },
      dependency4Results => {
        spies.dependency5Read();
        return {
          dependency4Results
        };
      }
    );

    dependency6 = new TestProvider("provider-3", {
      spy: spies.dependency6Read
    });

    dependency7 = new TestProvider("provider-4", {
      spy: spies.dependency7Read
    });

    dependency8 = new Selector(
      dependency6,
      {
        provider: () => dependency5,
        query: query => query
      },
      () => {
        spies.dependency8Read();
        return dependency7;
      }
    );

    dependency9 = new TestProvider("provider-5", {
      spy: spies.dependency9Read
    });

    dependency10 = new Selector(dependency8, () => {
      spies.dependency10Read();
      return () => dependency9;
    });

    dependency11 = new TestProvider("provider-6", {
      spy: spies.dependency11Read
    });

    dependency12 = new TestProvider("provider-7", {
      spy: spies.dependency12Read
    });

    dependency13 = new TestProvider("provider-8", {
      spy: spies.dependency13Read
    });

    dependency14 = new Selector(
      [
        dependency10,
        {
          provider: dependency11.query({ hasToThrow: new Error() }),
          catch: () => {
            return dependency12;
          }
        }
      ],
      () => {
        spies.dependency14Read();
        return () => dependency13;
      }
    );

    dependency15 = new TestProvider("provider-9", {
      spy: spies.dependency15Read
    });

    dependency16 = new Selector(
      dependency14,
      {
        provider: dependency15.query({ hasToThrow: new Error() }),
        catch: () => {
          return "foo";
        }
      },
      () => {
        spies.dependency16Read();
        return () => dependency13;
      }
    );

    selector = new Selector(
      query => dependency16.query(query),
      selector2Results => {
        spies.selectorRead();
        return selector2Results;
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("read method", () => {
    it("should not execute read methods more than once", async () => {
      selector.read();
      selector.read();
      selector.read();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(1);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(1);
      expect(spies.dependency4Read.callCount).toEqual(1);
      expect(spies.dependency5Read.callCount).toEqual(1);
      expect(spies.dependency6Read.callCount).toEqual(1);
      expect(spies.dependency7Read.callCount).toEqual(1);
      expect(spies.dependency8Read.callCount).toEqual(1);
      expect(spies.dependency9Read.callCount).toEqual(1);
      expect(spies.dependency10Read.callCount).toEqual(1);
      expect(spies.dependency11Read.callCount).toEqual(1);
      expect(spies.dependency12Read.callCount).toEqual(1);
      expect(spies.dependency13Read.callCount).toEqual(1);
      expect(spies.dependency14Read.callCount).toEqual(1);
      expect(spies.dependency15Read.callCount).toEqual(1);
      expect(spies.dependency16Read.callCount).toEqual(1);
      expect(spies.selectorRead.callCount).toEqual(1);
    });

    it("should execute selector read methods again when first dependency clean cache", async () => {
      await selector.read();
      dependency1.cleanCache();
      await selector.read();
      expect(spies.dependency1Read.callCount).toEqual(2);
      expect(spies.dependency2Read.callCount).toEqual(1);
      expect(spies.dependency3Read.callCount).toEqual(2);
      expect(spies.dependency4Read.callCount).toEqual(2);
      expect(spies.dependency5Read.callCount).toEqual(2);
      expect(spies.dependency6Read.callCount).toEqual(1);
      expect(spies.dependency7Read.callCount).toEqual(1);
      expect(spies.dependency8Read.callCount).toEqual(2);
      expect(spies.dependency9Read.callCount).toEqual(1);
      expect(spies.dependency10Read.callCount).toEqual(2);
      expect(spies.dependency11Read.callCount).toEqual(2); // Retries provider because it throwed error
      expect(spies.dependency12Read.callCount).toEqual(1);
      expect(spies.dependency13Read.callCount).toEqual(1);
      expect(spies.dependency14Read.callCount).toEqual(2);
      expect(spies.dependency15Read.callCount).toEqual(2); // Retries provider because it throwed error
      expect(spies.dependency16Read.callCount).toEqual(2);
      expect(spies.selectorRead.callCount).toEqual(2);
    });
  });
});
