/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider cache", () => {
  let sandbox;
  let spys;
  let TestProvider;
  let testProvider;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();

    spys = {
      read: test.sinon.spy()
    };

    TestProvider = class extends Provider {
      _read(query, extraParams) {
        const cached = this._cache.get(query);
        if (cached) {
          return cached;
        }
        const request = new Promise(resolve => {
          spys.read(query, extraParams);
          setTimeout(() => {
            resolve("foo-read-result");
          }, 50);
        });
        this._cache.set(query, request);
        return request;
      }
    };

    testProvider = new TestProvider();
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("without query", () => {
    const expectCalledOnce = () => () => {
      return testProvider.read().then(() => {
        return test.expect(spys.read.callCount).to.equal(1);
      });
    };

    test.it("should not execute method more than once if it is cached", () => {
      return testProvider.read().then(expectCalledOnce);
    });

    test.it("should not execute method more than once when it is called in parallel", () => {
      return Promise.all([testProvider.read(), testProvider.read(), testProvider.read()]).then(
        expectCalledOnce
      );
    });

    test.it(
      "should emit change event only twice, one when starts loading and one when finish loading",
      () => {
        let called = 0;
        testProvider.onChange(() => {
          called = called + 1;
        });
        return Promise.all([testProvider.read(), testProvider.read(), testProvider.read()]).then(
          () => {
            return testProvider.read().then(() => {
              return test.expect(called).to.equal(2);
            });
          }
        );
      }
    );

    test.it("should execute method again when cache is cleaned", () => {
      return Promise.all([testProvider.read(), testProvider.read(), testProvider.read()]).then(
        () => {
          testProvider.clean();
          return testProvider.read().then(() => {
            return test.expect(spys.read.callCount).to.equal(2);
          });
        }
      );
    });
  });

  test.describe("with query", () => {
    const QUERY = { foo: "foo-query" };
    const expectCalledOnce = () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(spys.read.callCount).to.equal(1);
        });
    };

    test.it("should not execute method more than once if it is cached", () => {
      return testProvider
        .query(QUERY)
        .read()
        .then(expectCalledOnce);
    });

    test.it("should not execute method more than once when it is called in parallel", () => {
      return Promise.all([
        testProvider.query(QUERY).read(),
        testProvider.query(QUERY).read(),
        testProvider.query(QUERY).read()
      ]).then(expectCalledOnce);
    });

    test.it(
      "should emit change event only twice, one when starts loading and one when finish loading",
      () => {
        let called = 0;
        testProvider.query(QUERY).onChange(() => {
          called = called + 1;
        });
        return Promise.all([
          testProvider.query(QUERY).read(),
          testProvider.query(QUERY).read(),
          testProvider.query(QUERY).read()
        ]).then(() => {
          return testProvider
            .query(QUERY)
            .read()
            .then(() => {
              return test.expect(called).to.equal(2);
            });
        });
      }
    );

    test.it("should execute method again when cache is cleaned", () => {
      return Promise.all([
        testProvider.query(QUERY).read(),
        testProvider.query(QUERY).read(),
        testProvider.query(QUERY).read()
      ]).then(() => {
        testProvider.query(QUERY).clean();
        return testProvider
          .query(QUERY)
          .read()
          .then(() => {
            return test.expect(spys.read.callCount).to.equal(2);
          });
      });
    });
  });
});
