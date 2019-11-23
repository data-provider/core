/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin loading", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _read() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      }
    };
    testOrigin = new TestOrigin("foo-id");
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("using getter", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testOrigin.read.getters.loading()).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testOrigin.read();
      test.expect(testOrigin.read.getters.loading()).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testOrigin.read().then(() => {
        return test.expect(testOrigin.read.getters.loading()).to.be.false();
      });
    });
  });

  test.describe("without query", () => {
    test.it("should return false until read is dispatched", () => {
      test.expect(testOrigin.read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testOrigin.read();
      test.expect(testOrigin.read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testOrigin.read().then(() => {
        return test.expect(testOrigin.read.loading).to.be.false();
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = "foo";
    test.it("should return false until read is dispatched", () => {
      test.expect(testOrigin.query(QUERY).read.loading).to.be.false();
    });

    test.it("should return true while read is loading", () => {
      testOrigin.query(QUERY).read();
      test.expect(testOrigin.query(QUERY).read.loading).to.be.true();
    });

    test.it("should return false when read finish", () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(testOrigin.query(QUERY).read.loading).to.be.false();
        });
    });
  });
});
