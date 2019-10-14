const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("Origin queries", () => {
  const FOO_QUERY = { foo: "foo", foo2: "foo-2" };
  const FOO_QUERY_2 = { foo3: "foo3" };
  const idToUrlParam = id => ({
    urlParams: {
      id
    }
  });
  let sandbox;
  let spys;
  let TestOrigin;
  let testOrigin;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    spys = {
      create: test.sinon.spy(),
      read: test.sinon.spy(),
      update: test.sinon.spy(),
      delete: test.sinon.spy()
    };
    TestOrigin = class extends Origin {
      _create(query, extraParams) {
        spys.create(query, extraParams);
        return Promise.resolve("foo-create-result");
      }
      _read(query, extraParams) {
        spys.read(query, extraParams);
        return Promise.resolve("foo-read-result");
      }
      _update(query, extraParams) {
        spys.update(query, extraParams);
        return Promise.resolve("foo-update-result");
      }
      _delete(query, extraParams) {
        spys.delete(query, extraParams);
        return Promise.resolve("foo-delete-result");
      }
    };

    testOrigin = new TestOrigin();
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("when executing methods", () => {
    test.describe("whithout query", () => {
      test.it("should pass the query value to the method", () => {
        return testOrigin.create().then(() => {
          return test.expect(spys.create.getCall(0).args[0]).to.be.undefined();
        });
      });

      test.it("should pass extra params to the method", () => {
        const extraParams = { foo: "foo" };
        return testOrigin.create(extraParams).then(() => {
          return test.expect(spys.create.getCall(0).args[1]).to.equal(extraParams);
        });
      });
    });

    test.describe("whith query", () => {
      const FOO_CUSTOM_QUERY = { foo: "foo", foo2: "foo-2" };
      test.it("should pass the query value to the method", () => {
        return testOrigin
          .query(FOO_CUSTOM_QUERY)
          .create()
          .then(() => {
            return test.expect(spys.create.getCall(0).args[0]).to.deep.equal(FOO_CUSTOM_QUERY);
          });
      });

      test.it("should clone the query object", () => {
        return testOrigin
          .query(FOO_QUERY)
          .create()
          .then(() => {
            return test.expect(spys.create.getCall(0).args[0]).to.not.equal(FOO_QUERY);
          });
      });

      test.it("should pass extra params to the method", () => {
        const extraParams = { foo: "foo" };
        return testOrigin
          .query(FOO_QUERY)
          .create(extraParams)
          .then(() => {
            return test.expect(spys.create.getCall(0).args[1]).to.equal(extraParams);
          });
      });
    });

    test.describe("whith chained query", () => {
      test.it("should pass the query value to the method", () => {
        return testOrigin
          .query(FOO_QUERY)
          .query(FOO_QUERY_2)
          .create()
          .then(() => {
            return test.expect(spys.create.getCall(0).args[0]).to.deep.equal({
              ...FOO_QUERY,
              ...FOO_QUERY_2
            });
          });
      });

      test.it("should clone the query object", () => {
        return testOrigin
          .query(FOO_QUERY)
          .query(FOO_QUERY_2)
          .create()
          .then(() => {
            return test.expect(spys.create.getCall(0).args[0]).to.not.equal({
              ...FOO_QUERY,
              ...FOO_QUERY_2
            });
          });
      });

      test.it("should pass extra params to the method", () => {
        const extraParams = { foo: "foo" };
        return testOrigin
          .query(FOO_QUERY)
          .query(FOO_QUERY_2)
          .create(extraParams)
          .then(() => {
            return test.expect(spys.create.getCall(0).args[1]).to.equal(extraParams);
          });
      });
    });
  });

  test.describe("when creating queried instance", () => {
    test.describe("with simple query", () => {
      test.it("should return the same query instance if it was already defined", () => {
        const INSTANCE_ID = "instance-unique-id";
        const queried = testOrigin.query(FOO_QUERY);
        queried._instanceId = INSTANCE_ID;
        const queried2 = testOrigin.query(FOO_QUERY);
        test.expect(queried2._instanceId).to.equal(INSTANCE_ID);
      });
    });

    test.describe("with chained query", () => {
      test.it("should return the same query instance if it was already defined", () => {
        const INSTANCE_ID = "instance-unique-id";
        const queried = testOrigin.query(FOO_QUERY).query(FOO_QUERY_2);
        queried._instanceId = INSTANCE_ID;
        const queried2 = testOrigin.query(FOO_QUERY).query(FOO_QUERY_2);
        test.expect(queried2._instanceId).to.equal(INSTANCE_ID);
      });
    });
  });

  test.describe("custom queries", () => {
    const FOO_ID = "foo";
    const FOO_CUSTOM_QUERY_RESULT = {
      urlParams: {
        id: "foo"
      }
    };
    test.beforeEach(() => {
      testOrigin.addCustomQuery({
        byId: idToUrlParam
      });
    });

    test.describe("when created", () => {
      test.it("public customQueries property should be available", () => {
        test.expect(testOrigin.customQueries.byId(FOO_ID)).to.deep.equal(FOO_CUSTOM_QUERY_RESULT);
      });
    });

    test.describe("when testing", () => {
      test.it("should be available at the test.customQueries object", () => {
        test
          .expect(testOrigin.test.customQueries.byId(FOO_ID))
          .to.deep.equal(FOO_CUSTOM_QUERY_RESULT);
      });
    });

    test.describe("when instance is not queried", () => {
      test.it("should apply the result of the custom query function as query", () => {
        return testOrigin
          .byId(FOO_ID)
          .read()
          .then(() => {
            return test
              .expect(spys.read.getCall(0).args[0])
              .to.deep.equal(FOO_CUSTOM_QUERY_RESULT);
          });
      });
    });

    test.describe("when instance is queried", () => {
      test.it("customQueries property should be still available", () => {
        test.expect(testOrigin.query(FOO_QUERY).customQueries.byId).to.not.be.undefined();
      });

      test.it(
        "should have available _id property of root instance in the _root._id property",
        () => {
          test.expect(testOrigin.query(FOO_QUERY)._root._id).to.equal(testOrigin._id);
        }
      );

      test.it(
        "should have available all properties of root instance in the _root property",
        () => {
          test.expect(testOrigin.query(FOO_QUERY)._root).to.equal(testOrigin);
        }
      );

      test.it("custom query should be still available", () => {
        test.expect(testOrigin.query(FOO_QUERY).byId).to.not.be.undefined();
      });

      test.it(
        "should apply the result of the custom query function as query, extended with previous queries",
        () => {
          return testOrigin
            .query(FOO_QUERY)
            .byId(FOO_ID)
            .read()
            .then(() => {
              return test.expect(spys.read.getCall(0).args[0]).to.deep.equal({
                ...FOO_QUERY,
                ...FOO_CUSTOM_QUERY_RESULT
              });
            });
        }
      );
    });
  });

  test.describe("custom queries chained", () => {
    const FOO_ID = "foo-id";
    const FOO_NAME = "foo-name";
    test.beforeEach(() => {
      testOrigin.addCustomQueries({
        byId: idToUrlParam,
        byName: name => ({
          urlQuery: {
            name
          }
        })
      });
    });

    test.it("should apply the result of the custom queries functions results extended", () => {
      return testOrigin
        .byId(FOO_ID)
        .byName(FOO_NAME)
        .read()
        .then(() => {
          return test.expect(spys.read.getCall(0).args[0]).to.deep.equal({
            urlParams: {
              id: FOO_ID
            },
            urlQuery: {
              name: FOO_NAME
            }
          });
        });
    });

    test.it("should have available all properties of root instance in the _root property", () => {
      test.expect(testOrigin.byId(FOO_ID).byName(FOO_NAME)._root).to.equal(testOrigin);
    });
  });
});
