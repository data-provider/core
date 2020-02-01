/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");
const { Selector } = require("../src/Selector");

test.describe("Selector events", () => {
  let sandbox;
  let TestProvider;
  let testProvider;
  let testSelector;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    TestProvider = class extends Provider {
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
    testProvider = new TestProvider();
    testSelector = new Selector(testProvider, result => result);
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("Without query", () => {
    test.it("should emit a change event when Selector change any property", () => {
      let spy = sandbox.spy();
      testSelector.onChange(spy);
      return testSelector.read().then(() => {
        return test.expect(spy).to.have.been.calledTwice();
      });
    });

    test.it("should emit a change event when Provider read cleanState is called", () => {
      let spy = sandbox.spy();
      testSelector.onChange(spy);
      return testSelector.read().then(() => {
        testSelector.read.cleanState();
        return test.expect(spy).to.have.been.calledThrice();
      });
    });

    test.it("should emit a change event when Provider cleanState is called", () => {
      let spy = sandbox.spy();
      testSelector.onChange(spy);
      return testSelector.read().then(() => {
        testSelector.cleanState();
        return test.expect(spy).to.have.been.calledThrice();
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

    test.it("should emit a changeAny event when Provider method is dispatched", () => {
      let spy = sandbox.spy();
      testSelector.onChangeAny(spy);
      return testSelector.read().then(() => {
        return test.expect(spy.getCall(0).args[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Provider method finish loading", () => {
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

    test.it("should emit a clean event when Provider cache is cleaned", () => {
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

    test.it("should emit a cleanAny event when Provider cache is cleaned", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return testSelector.read().then(() => {
        testSelector.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned instance", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return testSelector.read().then(() => {
        testSelector.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.instance._id).to.equal(testSelector._id),
          test.expect(eventData.instance._queryId).to.equal(undefined),
          test.expect(eventData.instance._root).to.equal(testSelector)
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

    test.it("should emit a change event when queried selector read cleanState is called", () => {
      let spy = sandbox.spy();
      queriedSelector.onChange(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.read.cleanState();
        return test.expect(spy).to.have.been.calledThrice();
      });
    });

    test.it("should emit a change event when queried selector cleanState is called", () => {
      let spy = sandbox.spy();
      queriedSelector.onChange(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.cleanState();
        return test.expect(spy).to.have.been.calledThrice();
      });
    });

    test.it("should emit a change event when selector cleanState is called", () => {
      let spy = sandbox.spy();
      queriedSelector.onChange(spy);
      return queriedSelector.read().then(() => {
        testSelector.cleanState();
        return test.expect(spy).to.have.been.calledThrice();
      });
    });

    // TODO in next major release. Currently selectors only listen to onClean events. They should listen also (maybe only) to data (value) state
    test.it.skip("should emit a change event when provider cleanState is called", () => {
      let spy = sandbox.spy();
      queriedSelector.onChange(spy);
      return queriedSelector.read().then(() => {
        testProvider.cleanState();
        return test.expect(spy).to.have.been.calledThrice();
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

    test.it("should emit a changeAny event when Provider method finish loading", () => {
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

    test.it("should emit a clean event when Provider cache is cleaned", () => {
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

    test.it("should emit a cleanAny event when Provider cache is cleaned", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned instance", () => {
      let spy = sandbox.spy();
      testSelector.onCleanAny(spy);
      return queriedSelector.read().then(() => {
        queriedSelector.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.instance._id).to.equal(queriedSelector._id),
          test.expect(eventData.instance._queryId).to.equal(`(${JSON.stringify(FOO_QUERY)})`),
          test.expect(eventData.instance._root).to.equal(testSelector)
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
