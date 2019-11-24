/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");
const { Selector } = require("../src/Selector");

test.describe("Selector test methods", () => {
  const RESULT = "result";
  let sandbox;
  let TestProvider;
  let testProvider;
  let testSelector;
  let spies;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spies = {
      query: sandbox.spy(),
      catch: sandbox.spy(),
      selector: sandbox.stub().callsFake(result => result)
    };
    TestProvider = class extends Provider {
      _read() {
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

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("providers query functions", () => {
    test.describe("when there are no concurrent queries", () => {
      test.it("should be avaible for testing at the test.queries property", () => {
        test.expect(testSelector.test.queries[0]("foo")).to.equal("foo");
        test.expect(spies.query).to.have.been.called();
      });
    });

    test.describe("when there are concurrent providers", () => {
      test.it("should be avaible for testing at the test.queries property as an array", () => {
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
        test.expect(testSelector.test.queries[0][0]("foo")).to.equal("foo-1");
        test.expect(testSelector.test.queries[0][1]("foo")).to.equal("foo-2");
        test.expect(spies.query).to.have.been.calledTwice();
      });

      test.it("should have all concurrent queries available recursively", () => {
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
        test.expect(testSelector.test.queries[0][0]("foo")).to.equal("foo-1");
        test.expect(testSelector.test.queries[0][1][0]("foo")).to.equal("foo-2");
        test.expect(testSelector.test.queries[0][1][1]("foo")).to.equal("foo-3");
        test.expect(spies.query.callCount).to.equal(3);
      });
    });
  });

  test.describe("providers catch functions", () => {
    test.describe("when there are no concurrent providers", () => {
      test.it("should be avaible for testing at the test.catches property", () => {
        test.expect(testSelector.test.catches[0]("foo")).to.equal("foo");
        test.expect(spies.catch).to.have.been.called();
      });
    });

    test.describe("when there are concurrent providers", () => {
      test.it("should be avaible for testing at the test.catches property as an array", () => {
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
        test.expect(testSelector.test.catches[0][0]("foo")).to.equal("foo-a");
        test.expect(testSelector.test.catches[0][1]("foo")).to.equal("foo-b");
        test.expect(spies.catch).to.have.been.calledTwice();
      });

      test.it("should have all concurrent catches available recursively", () => {
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
        test.expect(testSelector.test.catches[0][0]("foo")).to.equal("foo-a");
        test.expect(testSelector.test.catches[0][1][0]("foo")).to.equal("foo-b");
        test.expect(testSelector.test.catches[0][1][1]("foo")).to.equal("foo-c");
        test.expect(spies.catch.callCount).to.equal(3);
      });
    });
  });

  test.describe("selector function", () => {
    test.it("should be avaible for testing at the test.selector property", () => {
      test.expect(testSelector.test.selector("foo")).to.equal("foo");
      test.expect(spies.selector).to.have.been.called();
    });
  });
});
