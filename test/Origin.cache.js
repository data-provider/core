const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin cache", () => {
  let sandbox;
  let spys;
  let TestOrigin;
  let testOrigin;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();

    spys = {
      read: test.sinon.spy()
    };

    TestOrigin = class extends Origin {
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

    testOrigin = new TestOrigin();
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("without query", () => {
    const expectCalledOnce = () => () => {
      return testOrigin.read().then(() => {
        return test.expect(spys.read.callCount).to.equal(1);
      });
    };

    test.it("should not execute method more than once if it is cached", () => {
      return testOrigin.read().then(expectCalledOnce);
    });

    test.it("should not execute method more than once when it is called in parallel", () => {
      return Promise.all([testOrigin.read(), testOrigin.read(), testOrigin.read()]).then(
        expectCalledOnce
      );
    });

    test.it(
      "should emit change event only twice, one when starts loading and one when finish loading",
      () => {
        let called = 0;
        testOrigin.onChange(() => {
          called = called + 1;
        });
        return Promise.all([testOrigin.read(), testOrigin.read(), testOrigin.read()]).then(() => {
          return testOrigin.read().then(() => {
            return test.expect(called).to.equal(2);
          });
        });
      }
    );

    test.it("should execute method again when cache is cleaned", () => {
      return Promise.all([testOrigin.read(), testOrigin.read(), testOrigin.read()]).then(() => {
        testOrigin.clean();
        return testOrigin.read().then(() => {
          return test.expect(spys.read.callCount).to.equal(2);
        });
      });
    });
  });

  test.describe("with query", () => {
    const QUERY = { foo: "foo-query" };
    const expectCalledOnce = () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(() => {
          return test.expect(spys.read.callCount).to.equal(1);
        });
    };

    test.it("should not execute method more than once if it is cached", () => {
      return testOrigin
        .query(QUERY)
        .read()
        .then(expectCalledOnce);
    });

    test.it("should not execute method more than once when it is called in parallel", () => {
      return Promise.all([
        testOrigin.query(QUERY).read(),
        testOrigin.query(QUERY).read(),
        testOrigin.query(QUERY).read()
      ]).then(expectCalledOnce);
    });

    test.it(
      "should emit change event only twice, one when starts loading and one when finish loading",
      () => {
        let called = 0;
        testOrigin.query(QUERY).onChange(() => {
          called = called + 1;
        });
        return Promise.all([
          testOrigin.query(QUERY).read(),
          testOrigin.query(QUERY).read(),
          testOrigin.query(QUERY).read()
        ]).then(() => {
          return testOrigin
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
        testOrigin.query(QUERY).read(),
        testOrigin.query(QUERY).read(),
        testOrigin.query(QUERY).read()
      ]).then(() => {
        testOrigin.query(QUERY).clean();
        return testOrigin
          .query(QUERY)
          .read()
          .then(() => {
            return test.expect(spys.read.callCount).to.equal(2);
          });
      });
    });
  });
});
