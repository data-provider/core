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

test.describe("instances handler call method", () => {
  const FooProvider = class extends Provider {
    constructor(id, tags) {
      super(id, null, { uuid: id, tags });
    }

    _read() {
      return Promise.resolve();
    }

    fooMethod() {
      return this._id;
    }
  };
  let sandbox;
  let fooProvider;
  let fooProvider2;
  let fooProvider3;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    fooProvider = new FooProvider("foo-1", "tag-1");
    fooProvider2 = new FooProvider("foo-2", ["tag-2", "tag-3"]);
    fooProvider3 = new FooProvider("foo-3", "tag-3");
    new Selector(fooProvider, fooProvider2, () => {}, {
      uuid: "foo-4",
      tags: "tag-2"
    });

    sandbox.spy(fooProvider, "fooMethod");
    sandbox.spy(fooProvider2, "fooMethod");
    sandbox.spy(fooProvider3, "fooMethod");
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("when applied to all instances", () => {
    test.it("should call to defined method of all instances", () => {
      instances.call("fooMethod");

      return Promise.all([
        test.expect(fooProvider.fooMethod).to.have.been.called(),
        test.expect(fooProvider2.fooMethod).to.have.been.called(),
        test.expect(fooProvider3.fooMethod).to.have.been.called()
      ]);
    });

    test.it("should apply passed arguments to instances methods", () => {
      instances.call("fooMethod", "foo", "foo2", "foo3");

      return Promise.all([
        test.expect(fooProvider.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3"),
        test.expect(fooProvider2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3"),
        test.expect(fooProvider3.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3")
      ]);
    });

    test.it("should return an array containing results of all instances", () => {
      test
        .expect(instances.call("fooMethod"))
        .to.deep.equal(["foo-1", "foo-2", "foo-3", undefined]);
    });
  });

  test.describe("when method does not exist in provider", () => {
    test.beforeEach(() => {
      sandbox.stub(console, "warn");
    });

    test.it("should print a trace with the provider id", () => {
      instances.call("fooMethod");
      test.expect(console.warn.getCall(0).args[0]).to.contain("foo-4");
    });
  });

  test.describe("when used with getById", () => {
    test.it("should call to defined method only of selected instances", () => {
      instances.getById("foo-2").call("fooMethod");

      return Promise.all([
        test.expect(fooProvider.fooMethod).to.not.have.been.called(),
        test.expect(fooProvider2.fooMethod).to.have.been.called(),
        test.expect(fooProvider3.fooMethod).to.not.have.been.called()
      ]);
    });

    test.it("should apply passed arguments to instances methods", () => {
      instances.getById("foo-2").call("fooMethod", "foo", "foo2", "foo3");

      return test.expect(fooProvider2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3");
    });

    test.it(
      "should return an array containing the result of the method of selected provider",
      () => {
        test.expect(instances.getById("foo-2").call("fooMethod")).to.deep.equal(["foo-2"]);
      }
    );

    test.it("should return undefined if method does not exist in selected provider", () => {
      test.expect(instances.getById("foo-4").call("fooMethod")).to.deep.equal([undefined]);
    });
  });

  test.describe("when used with getByTag", () => {
    test.it("should call to defined method only of selected instances", () => {
      instances.getByTag("tag-2").call("fooMethod");

      return Promise.all([
        test.expect(fooProvider.fooMethod).to.not.have.been.called(),
        test.expect(fooProvider2.fooMethod).to.have.been.called(),
        test.expect(fooProvider3.fooMethod).to.not.have.been.called()
      ]);
    });

    test.it("should apply passed arguments to instances methods", () => {
      instances.getByTag("tag-2").call("fooMethod", "foo", "foo2", "foo3");

      return test.expect(fooProvider2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3");
    });

    test.it("should apply passed arguments to all instances methods", () => {
      instances.getByTag("tag-3").call("fooMethod", "foo", "foo2", "foo3");

      return Promise.all([
        test.expect(fooProvider2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3"),
        test.expect(fooProvider3.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3")
      ]);
    });

    test.it("should not call to instances not tagged with provided tag", () => {
      instances.getByTag("tag-3").call("fooMethod", "foo", "foo2", "foo3");

      return test.expect(fooProvider.fooMethod).to.not.have.been.called();
    });

    test.it("should return an array containing results of selected instances", () => {
      test.expect(instances.getByTag("tag-3").call("fooMethod")).to.deep.equal(["foo-2", "foo-3"]);
    });
  });
});
