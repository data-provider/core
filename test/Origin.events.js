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
      let spy = sandbox.spy();
      testOrigin.onChange(spy);
      return testOrigin.read().then(() => {
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let spy = sandbox.spy();
      testOrigin.onChange(spy);
      testOrigin.removeChangeListener(spy);
      return testOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a changeAny event when Origin method is dispatched", () => {
      let spy = sandbox.spy();
      testOrigin.onChangeAny(spy);
      return testOrigin.read().then(() => {
        return test.expect(spy.getCall(0).args[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Origin method finish loading", () => {
      let spy = sandbox.spy();
      testOrigin.onChangeAny(spy);
      return testOrigin.read().then(() => {
        return test.expect(spy.getCall(1).args[0].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let spy = sandbox.spy();
      testOrigin.onChangeAny(spy);
      testOrigin.removeChangeAnyListener(spy);
      return testOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a clean event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      testOrigin.onClean(spy);
      return testOrigin.read().then(() => {
        testOrigin.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let spy = sandbox.spy();
      testOrigin.onceClean(spy);
      return testOrigin.read().then(() => {
        testOrigin.clean();
        testOrigin.clean();
        return test.expect(spy.callCount).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let spy = sandbox.spy();
      testOrigin.onClean(spy);
      testOrigin.removeCleanListener(spy);
      return testOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a cleanAny event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      testOrigin.onCleanAny(spy);
      return testOrigin.read().then(() => {
        testOrigin.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned source", () => {
      let spy = sandbox.spy();
      testOrigin.onCleanAny(spy);
      return testOrigin.read().then(() => {
        testOrigin.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.source._id).to.equal(testOrigin._id),
          test.expect(eventData.source._queryId).to.equal(null),
          test.expect(eventData.source._root).to.equal(testOrigin)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let spy = sandbox.spy();
      testOrigin.onCleanAny(spy);
      testOrigin.removeCleanAnyListener(spy);
      return testOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
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
      let spy = sandbox.spy();
      queriedOrigin.onChange(spy);
      return queriedOrigin.read().then(() => {
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let spy = sandbox.spy();
      queriedOrigin.onChange(spy);
      queriedOrigin.removeChangeListener(spy);
      return queriedOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a changeAny event when Origin method is dispatched", () => {
      let spy = sandbox.spy();
      testOrigin.onChangeAny(spy);
      return queriedOrigin.read().then(() => {
        return test.expect(spy.getCall(0).args[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Origin method finish loading", () => {
      let spy = sandbox.spy();
      testOrigin.onChangeAny(spy);
      return queriedOrigin.read().then(() => {
        return test.expect(spy.getCall(1).args[0].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let spy = sandbox.spy();
      testOrigin.onChangeAny(spy);
      testOrigin.removeChangeAnyListener(spy);
      return queriedOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a clean event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      queriedOrigin.onClean(spy);
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let spy = sandbox.spy();
      queriedOrigin.onceClean(spy);
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        queriedOrigin.clean();
        return test.expect(spy.callCount).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let spy = sandbox.spy();
      queriedOrigin.onClean(spy);
      queriedOrigin.removeCleanListener(spy);
      return queriedOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a cleanAny event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      testOrigin.onCleanAny(spy);
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned source", () => {
      let spy = sandbox.spy();
      testOrigin.onCleanAny(spy);
      return queriedOrigin.read().then(() => {
        queriedOrigin.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.source._id).to.equal(queriedOrigin._id),
          test.expect(eventData.source._queryId).to.equal(JSON.stringify(FOO_QUERY)),
          test.expect(eventData.source._root).to.equal(testOrigin)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let spy = sandbox.spy();
      testOrigin.onCleanAny(spy);
      testOrigin.removeCleanAnyListener(spy);
      return queriedOrigin.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });
  });
});
