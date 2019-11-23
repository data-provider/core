/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("Provider events", () => {
  let sandbox;
  let TestProvider;
  let testProvider;

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
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("Without query", () => {
    test.it("should emit a change event when Provider change any property", () => {
      let spy = sandbox.spy();
      testProvider.onChange(spy);
      return testProvider.read().then(() => {
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let spy = sandbox.spy();
      testProvider.onChange(spy);
      testProvider.removeChangeListener(spy);
      return testProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a changeAny event when Provider method is dispatched", () => {
      let spy = sandbox.spy();
      testProvider.onChangeAny(spy);
      return testProvider.read().then(() => {
        return test.expect(spy.getCall(0).args[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Provider method finish loading", () => {
      let spy = sandbox.spy();
      testProvider.onChangeAny(spy);
      return testProvider.read().then(() => {
        return test.expect(spy.getCall(1).args[0].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let spy = sandbox.spy();
      testProvider.onChangeAny(spy);
      testProvider.removeChangeAnyListener(spy);
      return testProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a clean event when Provider cache is cleaned", () => {
      let spy = sandbox.spy();
      testProvider.onClean(spy);
      return testProvider.read().then(() => {
        testProvider.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let spy = sandbox.spy();
      testProvider.onceClean(spy);
      return testProvider.read().then(() => {
        testProvider.clean();
        testProvider.clean();
        return test.expect(spy.callCount).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let spy = sandbox.spy();
      testProvider.onClean(spy);
      testProvider.removeCleanListener(spy);
      return testProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a cleanAny event when Provider cache is cleaned", () => {
      let spy = sandbox.spy();
      testProvider.onCleanAny(spy);
      return testProvider.read().then(() => {
        testProvider.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned instance", () => {
      let spy = sandbox.spy();
      testProvider.onCleanAny(spy);
      return testProvider.read().then(() => {
        testProvider.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.instance._id).to.equal(testProvider._id),
          test.expect(eventData.instance._queryId).to.equal(undefined),
          test.expect(eventData.instance._root).to.equal(testProvider)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let spy = sandbox.spy();
      testProvider.onCleanAny(spy);
      testProvider.removeCleanAnyListener(spy);
      return testProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });
  });

  test.describe("with query", () => {
    const FOO_QUERY = {
      foo: "foo"
    };
    let queriedProvider;

    test.beforeEach(() => {
      queriedProvider = testProvider.query(FOO_QUERY);
    });

    test.it("should emit a change event when Provider change any property", () => {
      let spy = sandbox.spy();
      queriedProvider.onChange(spy);
      return queriedProvider.read().then(() => {
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should remove change listener with removeChangeListener method", () => {
      let spy = sandbox.spy();
      queriedProvider.onChange(spy);
      queriedProvider.removeChangeListener(spy);
      return queriedProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a changeAny event when Provider method is dispatched", () => {
      let spy = sandbox.spy();
      testProvider.onChangeAny(spy);
      return queriedProvider.read().then(() => {
        return test.expect(spy.getCall(0).args[0].action).to.equal("readDispatch");
      });
    });

    test.it("should emit a changeAny event when Provider method finish loading", () => {
      let spy = sandbox.spy();
      testProvider.onChangeAny(spy);
      return queriedProvider.read().then(() => {
        return test.expect(spy.getCall(1).args[0].action).to.equal("readSuccess");
      });
    });

    test.it("should remove changeAny event with removeChangeAnyListener method", () => {
      let spy = sandbox.spy();
      testProvider.onChangeAny(spy);
      testProvider.removeChangeAnyListener(spy);
      return queriedProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a clean event when Provider cache is cleaned", () => {
      let spy = sandbox.spy();
      queriedProvider.onClean(spy);
      return queriedProvider.read().then(() => {
        queriedProvider.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should execute clean event only once when it is added using onceClean method", () => {
      let spy = sandbox.spy();
      queriedProvider.onceClean(spy);
      return queriedProvider.read().then(() => {
        queriedProvider.clean();
        queriedProvider.clean();
        return test.expect(spy.callCount).to.equal(1);
      });
    });

    test.it("should remove clean event with removeCleanListener method", () => {
      let spy = sandbox.spy();
      queriedProvider.onClean(spy);
      queriedProvider.removeCleanListener(spy);
      return queriedProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });

    test.it("should emit a cleanAny event when Provider cache is cleaned", () => {
      let spy = sandbox.spy();
      testProvider.onCleanAny(spy);
      return queriedProvider.read().then(() => {
        queriedProvider.clean();
        return test.expect(spy).to.have.been.called();
      });
    });

    test.it("should emit a cleanAny event containing data about the cleaned instance", () => {
      let spy = sandbox.spy();
      testProvider.onCleanAny(spy);
      return queriedProvider.read().then(() => {
        queriedProvider.clean();
        const eventData = spy.getCall(0).args[0];
        return Promise.all([
          test.expect(eventData.action).to.equal("clean"),
          test.expect(eventData.instance._id).to.equal(queriedProvider._id),
          test.expect(eventData.instance._queryId).to.equal(`(${JSON.stringify(FOO_QUERY)})`),
          test.expect(eventData.instance._root).to.equal(testProvider)
        ]);
      });
    });

    test.it("should remove cleanAny event with removeCleanAnyListener method", () => {
      let spy = sandbox.spy();
      testProvider.onCleanAny(spy);
      testProvider.removeCleanAnyListener(spy);
      return queriedProvider.read().then(() => {
        return test.expect(spy).to.not.have.been.called();
      });
    });
  });
});
