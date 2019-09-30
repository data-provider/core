const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("Selector events", () => {
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testSelector;

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
    testSelector = new Selector(testOrigin, result => result);
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("Without query", () => {
    test.it("should emit a change event when Selector change any property", () => {
      let spy = sandbox.spy();
      testSelector.onChange(spy);
      return testSelector.read().then(() => {
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let spy = sandbox.spy();
      testSelector.onChange(spy);
      testSelector.removeChangeListener(spy);
      return testSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a changeAny event when Origin method is dispatched", () => {
      let spy = sandbox.spy();
      testSelector.onChangeAny(spy);
      return testSelector.read().then(() => {
        return test.expect(spy.getCall(0).args[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Origin method finish loading", () => {
      let spy = sandbox.spy();
      testSelector.onChangeAny(spy);
      return testSelector.read().then(() => {
        return test.expect(spy.getCall(1).args[0].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let spy = sandbox.spy();
      testSelector.onChangeAny(spy);
      testSelector.removeChangeAnyListener(spy);
      return testSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a clean event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      testSelector.onClean(spy);
      return testSelector.read().then(() => {
        testSelector.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let spy = sandbox.spy();
      testSelector.onceClean(spy);
      return testSelector.read().then(() => {
        testSelector.clean();
        testSelector.clean();
        return test.expect(spy.callCount).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let spy = sandbox.spy();
      testSelector.onClean(spy);
      testSelector.removeCleanListener(spy);
      return testSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a cleanAny event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return testSelector.read().then(() => {
        testSelector.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned source", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return testSelector.read().then(() => {
        testSelector.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.source._id).to.equal(testSelector._id),
          test.expect(eventData.source._queryId).to.equal(null),
          test.expect(eventData.source._root).to.equal(testSelector)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      testSelector.removeCleanAnyListener(spy);
      return testSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });
  });

  test.describe("with query", () => {
    const FOO_QUERY = {
      foo: "foo"
    };
    let queriedSelector;

    test.beforeEach(() => {
      queriedSelector = testSelector.query(FOO_QUERY);
    });

    test.it("should emit a change event when Selector change any property", () => {
      let spy = sandbox.spy();
      queriedSelector.onChange(spy);
      return queriedSelector.read().then(() => {
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let spy = sandbox.spy();
      queriedSelector.onChange(spy);
      queriedSelector.removeChangeListener(spy);
      return queriedSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a changeAny event when Selector method is dispatched", () => {
      let spy = sandbox.spy();
      testSelector.onChangeAny(spy);
      return queriedSelector.read().then(() => {
        return test.expect(spy.getCall(0).args[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Origin method finish loading", () => {
      let spy = sandbox.spy();
      testSelector.onChangeAny(spy);
      return queriedSelector.read().then(() => {
        return test.expect(spy.getCall(1).args[0].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let spy = sandbox.spy();
      testSelector.onChangeAny(spy);
      testSelector.removeChangeAnyListener(spy);
      return queriedSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a clean event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      queriedSelector.onClean(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let spy = sandbox.spy();
      queriedSelector.onceClean(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.clean();
        queriedSelector.clean();
        return test.expect(spy.callCount).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let spy = sandbox.spy();
      queriedSelector.onClean(spy);
      queriedSelector.removeCleanListener(spy);
      return queriedSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a cleanAny event when Origin cache is cleaned", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned source", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.source._id).to.equal(queriedSelector._id),
          test.expect(eventData.source._queryId).to.equal(JSON.stringify(FOO_QUERY)),
          test.expect(eventData.source._root).to.equal(testOrigin)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      testSelector.removeCleanAnyListener(spy);
      return queriedSelector.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });
  });
});
