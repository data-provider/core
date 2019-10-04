const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin defaultValue", () => {
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("when Origin has defaultValue defined", () => {
    test.describe("read method", () => {
      test.describe("without query", () => {
        test.it("should return defaultValue until real value is returned", () => {
          const TestOrigin = class extends Origin {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testOrigin = new TestOrigin("", 4);
          test.expect(testOrigin.read.value).to.equal(4);
          return testOrigin.read().then(() => {
            return test.expect(testOrigin.read.value).to.equal(5);
          });
        });

        test.it("should return a clone of defaultValue", () => {
          const defaultValue = {
            foo: {
              foo2: "foo"
            }
          };
          const TestOrigin = class extends Origin {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testOrigin = new TestOrigin("", defaultValue);
          test.expect(testOrigin.read.value).to.not.equal(defaultValue);
          test.expect(testOrigin.read.value).to.deep.equal(defaultValue);
        });
      });

      test.describe("with query", () => {
        test.it("should return defaultValue until real value is returned", () => {
          const QUERY = "foo";
          const TestOrigin = class extends Origin {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testOrigin = new TestOrigin("", 4).query(QUERY);
          test.expect(testOrigin.read.value).to.equal(4);
          return testOrigin.read().then(() => {
            return test.expect(testOrigin.read.value).to.equal(5);
          });
        });
      });

      test.describe("with chained query", () => {
        test.it("should return defaultValue until real value is returned", () => {
          const QUERY = "foo";
          const TestOrigin = class extends Origin {
            _read() {
              return Promise.resolve(5);
            }
          };
          const testOrigin = new TestOrigin("", 4).query(QUERY).query("foo2");
          test.expect(testOrigin.read.value).to.equal(4);
          return testOrigin.read().then(() => {
            return test.expect(testOrigin.read.value).to.equal(5);
          });
        });
      });
    });

    const testMethodsWithNoDefaultValue = methodName => {
      const values = {
        create: "foo-create-value",
        update: "foo-update-value",
        delete: "foo-delete-value"
      };

      const TestOrigin = class extends Origin {
        _create() {
          return Promise.resolve(values.create);
        }
        _update() {
          return Promise.resolve(values.update);
        }
        _delete() {
          return Promise.resolve(values.delete);
        }
      };

      test.describe(`${methodName} method`, () => {
        test.describe("without query", () => {
          test.it("should return undefined until real value is returned", () => {
            const testOrigin = new TestOrigin("", 4);
            test.expect(testOrigin[methodName].value).to.be.undefined();
            return testOrigin[methodName]().then(() => {
              return test.expect(testOrigin[methodName].value).to.equal(values[methodName]);
            });
          });
        });

        test.describe("with query", () => {
          test.it("should return undefined until real value is returned", () => {
            const QUERY = "foo";
            const testOrigin = new TestOrigin("", 4).query(QUERY);
            test.expect(testOrigin[methodName].value).to.be.undefined();
            return testOrigin[methodName]().then(() => {
              return test.expect(testOrigin[methodName].value).to.equal(values[methodName]);
            });
          });
        });
      });
    };

    testMethodsWithNoDefaultValue("create");
    testMethodsWithNoDefaultValue("update");
    testMethodsWithNoDefaultValue("delete");
  });
});
