/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, Selector } = require("../../src/index");

describe("Selector test methods", () => {
  const RESULT = "result";
  let sandbox;
  let TestProvider;
  let testProvider;
  let testSelector;
  let spies;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    spies = {
      query: sandbox.spy(),
      catch: sandbox.spy(),
      selector: sandbox.stub().callsFake(result => result)
    };
    TestProvider = class extends Provider {
      _readMethod() {
        return Promise.resolve(RESULT);
      }
    };
    testProvider = new TestProvider();
    testSelector = new Selector(
      {
        provider: testProvider,
        query: query => {
          spies.query();
          return query;
        },
        catch: err => {
          spies.catch();
          return err;
        }
      },
      spies.selector
    );
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("providers query functions", () => {
    describe("when there are no concurrent queries", () => {
      it("should be avaible for testing at the dependencies property", () => {
        expect(testSelector.dependencies[0].query("foo")).toEqual("foo");
        expect(spies.query.callCount).toEqual(1);
      });
    });

    describe("when there are concurrent providers", () => {
      it("should be avaible for testing at the dependencies property as an array", () => {
        const testProvider2 = new TestProvider();
        testSelector = new Selector(
          [
            {
              provider: testProvider,
              query: query => {
                spies.query();
                return `${query}-1`;
              }
            },
            {
              provider: testProvider2,
              query: query => {
                spies.query();
                return `${query}-2`;
              }
            }
          ],
          spies.selector
        );
        expect(testSelector.dependencies[0][0].query("foo")).toEqual("foo-1");
        expect(testSelector.dependencies[0][1].query("foo")).toEqual("foo-2");
        expect(spies.query.callCount).toEqual(2);
      });

      it("should have all concurrent queries available recursively", () => {
        const testProvider2 = new TestProvider();
        const testProvider3 = new TestProvider();
        testSelector = new Selector(
          [
            {
              provider: testProvider,
              query: query => {
                spies.query();
                return `${query}-1`;
              }
            },
            [
              {
                provider: testProvider2,
                query: query => {
                  spies.query();
                  return `${query}-2`;
                }
              },
              {
                provider: testProvider3,
                query: query => {
                  spies.query();
                  return `${query}-3`;
                }
              }
            ]
          ],
          spies.selector
        );
        expect(testSelector.dependencies[0][0].query("foo")).toEqual("foo-1");
        expect(testSelector.dependencies[0][1][0].query("foo")).toEqual("foo-2");
        expect(testSelector.dependencies[0][1][1].query("foo")).toEqual("foo-3");
        expect(spies.query.callCount).toEqual(3);
      });
    });
  });

  describe("providers catch functions", () => {
    describe("when there are no concurrent providers", () => {
      it("should be avaible for testing at the  catches property", () => {
        expect(testSelector.dependencies[0].catch("foo")).toEqual("foo");
        expect(spies.catch.callCount).toEqual(1);
      });
    });

    describe("when there are concurrent providers", () => {
      it("should be avaible for testing at the  catches property as an array", () => {
        const testProvider2 = new TestProvider();
        testSelector = new Selector(
          [
            {
              provider: testProvider,
              catch: err => {
                spies.catch();
                return `${err}-a`;
              }
            },
            {
              provider: testProvider2,
              catch: err => {
                spies.catch();
                return `${err}-b`;
              }
            }
          ],
          spies.selector
        );
        expect(testSelector.dependencies[0][0].catch("foo")).toEqual("foo-a");
        expect(testSelector.dependencies[0][1].catch("foo")).toEqual("foo-b");
        expect(spies.catch.callCount).toEqual(2);
      });

      it("should have all concurrent catches available recursively", () => {
        const testProvider2 = new TestProvider();
        const testProvider3 = new TestProvider();
        testSelector = new Selector(
          [
            {
              provider: testProvider,
              catch: err => {
                spies.catch();
                return `${err}-a`;
              }
            },
            [
              {
                provider: testProvider2,
                catch: err => {
                  spies.catch();
                  return `${err}-b`;
                }
              },
              {
                provider: testProvider3,
                catch: err => {
                  spies.catch();
                  return `${err}-c`;
                }
              }
            ]
          ],
          spies.selector
        );
        expect(testSelector.dependencies[0][0].catch("foo")).toEqual("foo-a");
        expect(testSelector.dependencies[0][1][0].catch("foo")).toEqual("foo-b");
        expect(testSelector.dependencies[0][1][1].catch("foo")).toEqual("foo-c");
        expect(spies.catch.callCount).toEqual(3);
      });
    });
  });

  describe("selector function", () => {
    it("should be avaible for testing at the  selector property", () => {
      expect(testSelector.selector("foo")).toEqual("foo");
      expect(spies.selector.callCount).toEqual(1);
    });
  });
});
