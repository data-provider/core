const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin defaultValue as callback", () => {
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("when Origin has defaultValue callback defined", () => {
    test.describe("read method", () => {
      test.describe("without query", () => {
        test.it(
          "should return the result of defaultValue callback until real value is returned",
          () => {
            const TestOrigin = class extends Origin {
              constructor(id, defaultValue, options) {
                const getDefaultValue = defaultValue => {
                  return defaultValue + 2;
                };
                super(id, getDefaultValue, options);
              }

              _read() {
                return Promise.resolve(5);
              }
            };
            const testOrigin = new TestOrigin("", 4);
            test.expect(testOrigin.read.value).to.equal(6);
            return testOrigin.read().then(() => {
              return test.expect(testOrigin.read.value).to.equal(5);
            });
          }
        );
      });

      test.describe("with query", () => {
        const QUERY = "foo-query";
        const TestOrigin = class extends Origin {
          constructor(id, defaultValue, options) {
            const getDefaultValue = query => {
              return query;
            };
            super(id, getDefaultValue, options);
          }

          _read() {
            return Promise.resolve("foo-result");
          }
        };

        test.describe("with simple query", () => {
          test.it(
            "should pass query to defaultValue callback, and return the result until real value is returned",
            () => {
              const testOrigin = new TestOrigin("", 4).query(QUERY);
              test.expect(testOrigin.read.value).to.equal("foo-query");
              return testOrigin.read().then(() => {
                return test.expect(testOrigin.read.value).to.equal("foo-result");
              });
            }
          );
        });

        test.describe("with chained query", () => {
          test.it(
            "should pass chained query to defaultValue callback, and return the result until real value is returned",
            () => {
              const testOrigin = new TestOrigin("", 4)
                .query({
                  foo: "foo"
                })
                .query({
                  foo2: "foo2"
                });
              test.expect(testOrigin.read.value).to.deep.equal({
                foo: "foo",
                foo2: "foo2"
              });
              return testOrigin.read().then(() => {
                return test.expect(testOrigin.read.value).to.equal("foo-result");
              });
            }
          );
        });
      });
    });
  });
});
