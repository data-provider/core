/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider loading", () => {
  let sandbox;
  let TestProvider;
  let testProvider;

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
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("using getter", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testProvider.read.getters.loading()).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testProvider.read();
      test.expect(testProvider.read.getters.loading()).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testProvider.read().then(() => {
        return test.expect(testProvider.read.getters.loading()).to.be.false();
      });
    });
  });

  test.describe("without query", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testProvider.read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testProvider.read();
      test.expect(testProvider.read.loading).to.be.true();
    });

    test.it("should return true even when read cleanState is called", () => {
      testProvider.read();
      testProvider.read.cleanState();
      test.expect(testProvider.read.loading).to.be.true();
    });

    test.it("should return true even when cleanState is called", () => {
      testProvider.read();
      testProvider.cleanState();
      test.expect(testProvider.read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testProvider.read().then(() => {
        return test.expect(testProvider.read.loading).to.be.false();
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return false until read is dispatched", () => {
      test.expect(testProvider.query(QUERY).read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testProvider.query(QUERY).read();
      test.expect(testProvider.query(QUERY).read.loading).to.be.true();
    });

    test.it(
      "should return true while read is loading even when queried read cleanState is called",
      () => {
        testProvider.query(QUERY).read();
        testProvider.query(QUERY).read.cleanState();
        test.expect(testProvider.query(QUERY).read.loading).to.be.true();
      }
    );

    test.it("should return true while read is loading even when cleanState is called", () => {
      testProvider.query(QUERY).read();
      testProvider.query(QUERY).cleanState();
      test.expect(testProvider.query(QUERY).read.loading).to.be.true();
    });

    test.it("should return true while read is loading even when cleanState is called", () => {
      testProvider.query(QUERY).read();
      testProvider.cleanState();
      test.expect(testProvider.query(QUERY).read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(testProvider.query(QUERY).read.loading).to.be.false();
        });
    });
  });
});
