const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");

test.describe("Origin events", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestOrigin = class extends Origin {
      _create() {
        return Promise.resolve("foo-create-result");
      }
      _read() {
        return Promise.resolve("foo-read-result");
      }
      _update() {
        return Promise.resolve("foo-update-result");
      }
      _delete() {
        return Promise.resolve("foo-delete-result");
      }
    };
    testOrigin = new TestOrigin();
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("Without query", () => {
    test.it("should emit a change event when Origin change any property", () => {
      let called = false;
      testOrigin.onChange(() => {
        called = true;
      });
      return testOrigin.read().then(() => {
        return test.expect(called).to.be.true();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let called = false;
      const eventHandler = () => {
        called = true;
      };
      testOrigin.onChange(eventHandler);
      testOrigin.removeChangeListener(eventHandler);
      return testOrigin.read().then(() => {
        return test.expect(called).to.be.false();
      });
    });

    test.it("should emit a changeAny event when Origin method is dispatched", () => {
      let eventProperties = [];
      testOrigin.onChangeAny(props => {
        eventProperties.push(props);
      });
      return testOrigin.read().then(() => {
        return test.expect(eventProperties[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Origin method finish loading", () => {
      let eventProperties = [];
      testOrigin.onChangeAny(props => {
        eventProperties.push(props);
      });
      return testOrigin.read().then(() => {
        return test.expect(eventProperties[1].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let eventProperties = [];
      const eventHandler = props => {
        eventProperties.push(props);
      };
      testOrigin.onChangeAny(eventHandler);
      testOrigin.removeChangeAnyListener(eventHandler);
      return testOrigin.read().then(() => {
        return test.expect(eventProperties.length).to.equal(0);
      });
    });

    test.it("should emit a clean event when Origin cache is cleaned", () => {
      let called = false;
      testOrigin.onClean(() => {
        called = true;
      });
      return testOrigin.read().then(() => {
        testOrigin.clean();
        return test.expect(called).to.be.true();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let called = 0;
      testOrigin.onceClean(() => {
        called = called + 1;
      });
      return testOrigin.read().then(() => {
        testOrigin.clean();
        testOrigin.clean();
        return test.expect(called).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let called = false;
      const eventHandler = () => {
        called = true;
      };
      testOrigin.onClean(eventHandler);
      testOrigin.removeCleanListener(eventHandler);
      return testOrigin.read().then(() => {
        return test.expect(called).to.be.false();
      });
    });

    test.it("should emit a cleanAny event when Origin cache is cleaned", () => {
      let called = false;
      testOrigin.onCleanAny(() => {
        called = true;
      });
      return testOrigin.read().then(() => {
        testOrigin.clean();
        return test.expect(called).to.be.true();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned source", () => {
      let eventData;
      testOrigin.onCleanAny(data => {
        eventData = data;
      });
      return testOrigin.read().then(() => {
        testOrigin.clean();
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.source._id).to.equal(testOrigin._id),
          test.expect(eventData.source._queryId).to.equal(null),
          test.expect(eventData.source._root).to.equal(testOrigin)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let called = false;
      const eventHandler = () => {
        called = true;
      };
      testOrigin.onCleanAny(eventHandler);
      testOrigin.removeCleanAnyListener(eventHandler);
      return testOrigin.read().then(() => {
        return test.expect(called).to.be.false();
      });
    });
  });

  test.describe("with query", () => {
    const FOO_QUERY = {
      foo: "foo"
    };
    let queriedOrigin;

    test.beforeEach(() => {
      queriedOrigin = testOrigin.query(FOO_QUERY);
    });

    test.it("should emit a change event when Origin change any property", () => {
      let called = false;
      queriedOrigin.onChange(() => {
        called = true;
      });
      return queriedOrigin.read().then(() => {
        return test.expect(called).to.be.true();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let called = false;
      const eventHandler = () => {
        called = true;
      };
      queriedOrigin.onChange(eventHandler);
      queriedOrigin.removeChangeListener(eventHandler);
      return queriedOrigin.read().then(() => {
        return test.expect(called).to.be.false();
      });
    });

    test.it("should emit a changeAny event when Origin method is dispatched", () => {
      let eventProperties = [];
      testOrigin.onChangeAny(props => {
        eventProperties.push(props);
      });
      return queriedOrigin.read().then(() => {
        return test.expect(eventProperties[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Origin method finish loading", () => {
      let eventProperties = [];
      testOrigin.onChangeAny(props => {
        eventProperties.push(props);
      });
      return queriedOrigin.read().then(() => {
        return test.expect(eventProperties[1].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let eventProperties = [];
      const eventHandler = props => {
        eventProperties.push(props);
      };
      testOrigin.onChangeAny(eventHandler);
      testOrigin.removeChangeAnyListener(eventHandler);
      return queriedOrigin.read().then(() => {
        return test.expect(eventProperties.length).to.equal(0);
      });
    });

    test.it("should emit a clean event when Origin cache is cleaned", () => {
      let called = false;
      queriedOrigin.onClean(() => {
        called = true;
      });
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        return test.expect(called).to.be.true();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let called = 0;
      queriedOrigin.onceClean(() => {
        called = called + 1;
      });
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        queriedOrigin.clean();
        return test.expect(called).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let called = false;
      const eventHandler = () => {
        called = true;
      };
      queriedOrigin.onClean(eventHandler);
      queriedOrigin.removeCleanListener(eventHandler);
      return queriedOrigin.read().then(() => {
        return test.expect(called).to.be.false();
      });
    });

    test.it("should emit a cleanAny event when Origin cache is cleaned", () => {
      let called = false;
      testOrigin.onCleanAny(() => {
        called = true;
      });
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        return test.expect(called).to.be.true();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned source", () => {
      let eventData;
      testOrigin.onCleanAny(data => {
        eventData = data;
      });
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.source._id).to.equal(queriedOrigin._id),
          test.expect(eventData.source._queryId).to.equal(JSON.stringify(FOO_QUERY)),
          test.expect(eventData.source._root).to.equal(testOrigin)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let called = false;
      const eventHandler = () => {
        called = true;
      };
      testOrigin.onCleanAny(eventHandler);
      testOrigin.removeCleanAnyListener(eventHandler);
      return queriedOrigin.read().then(() => {
        return test.expect(called).to.be.false();
      });
    });
  });
});
