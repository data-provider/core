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

test.describe("Selector loading", () => {
  let sandbox;
  let TestProvider;
  let testProvider;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestProvider = class extends Provider {
      _read() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      }
    };
    testProvider = new TestProvider("foo-id");
    testSelector = new Selector(testProvider, originResult => originResult);
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("using getter", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testSelector.read.getters.loading()).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testSelector.read();
      test.expect(testSelector.read.getters.loading()).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testSelector.read().then(() => {
        return test.expect(testSelector.read.getters.loading()).to.be.false();
      });
    });
  });

  test.describe("without query", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testSelector.read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testSelector.read();
      test.expect(testSelector.read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testSelector.read().then(() => {
        return test.expect(testSelector.read.loading).to.be.false();
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return false until read is dispatched", () => {
      test.expect(testSelector.query(QUERY).read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testSelector.query(QUERY).read();
      test.expect(testSelector.query(QUERY).read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testSelector
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(testSelector.query(QUERY).read.loading).to.be.false();
        });
    });
  });
});
