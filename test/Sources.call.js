/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("sources handler call method", () => {
  const FooOrigin = class extends Origin {
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
  let fooSource;
  let fooSource2;
  let fooSource3;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    fooSource = new FooOrigin("foo-1", "tag-1");
    fooSource2 = new FooOrigin("foo-2", ["tag-2", "tag-3"]);
    fooSource3 = new FooOrigin("foo-3", "tag-3");
    new Selector(fooSource, fooSource2, () => {}, {
      uuid: "foo-4",
      tags: "tag-2"
    });

    sandbox.spy(fooSource, "fooMethod");
    sandbox.spy(fooSource2, "fooMethod");
    sandbox.spy(fooSource3, "fooMethod");
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("when applied to all sources", () => {
    test.it("should call to defined method of all sources", () => {
      sources.call("fooMethod");

      return Promise.all([
        test.expect(fooSource.fooMethod).to.have.been.called(),
        test.expect(fooSource2.fooMethod).to.have.been.called(),
        test.expect(fooSource3.fooMethod).to.have.been.called()
      ]);
    });

    test.it("should apply passed arguments to sources methods", () => {
      sources.call("fooMethod", "foo", "foo2", "foo3");

      return Promise.all([
        test.expect(fooSource.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3"),
        test.expect(fooSource2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3"),
        test.expect(fooSource3.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3")
      ]);
    });

    test.it("should return an array containing results of all sources", () => {
      test.expect(sources.call("fooMethod")).to.deep.equal(["foo-1", "foo-2", "foo-3", undefined]);
    });
  });

  test.describe("when method does not exist in source", () => {
    test.beforeEach(() => {
      sandbox.stub(console, "warn");
    });

    test.it("should print a trace with the source id", () => {
      sources.call("fooMethod");
      test.expect(console.warn.getCall(0).args[0]).to.contain("foo-4");
    });
  });

  test.describe("when used with getById", () => {
    test.it("should call to defined method only of selected sources", () => {
      sources.getById("foo-2").call("fooMethod");

      return Promise.all([
        test.expect(fooSource.fooMethod).to.not.have.been.called(),
        test.expect(fooSource2.fooMethod).to.have.been.called(),
        test.expect(fooSource3.fooMethod).to.not.have.been.called()
      ]);
    });

    test.it("should apply passed arguments to sources methods", () => {
      sources.getById("foo-2").call("fooMethod", "foo", "foo2", "foo3");

      return test.expect(fooSource2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3");
    });

    test.it(
      "should return an array containing the result of the method of selected source",
      () => {
        test.expect(sources.getById("foo-2").call("fooMethod")).to.deep.equal(["foo-2"]);
      }
    );

    test.it("should return undefined if method does not exist in selected source", () => {
      test.expect(sources.getById("foo-4").call("fooMethod")).to.deep.equal([undefined]);
    });
  });

  test.describe("when used with getByTag", () => {
    test.it("should call to defined method only of selected sources", () => {
      sources.getByTag("tag-2").call("fooMethod");

      return Promise.all([
        test.expect(fooSource.fooMethod).to.not.have.been.called(),
        test.expect(fooSource2.fooMethod).to.have.been.called(),
        test.expect(fooSource3.fooMethod).to.not.have.been.called()
      ]);
    });

    test.it("should apply passed arguments to sources methods", () => {
      sources.getByTag("tag-2").call("fooMethod", "foo", "foo2", "foo3");

      return test.expect(fooSource2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3");
    });

    test.it("should apply passed arguments to all sources methods", () => {
      sources.getByTag("tag-3").call("fooMethod", "foo", "foo2", "foo3");

      return Promise.all([
        test.expect(fooSource2.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3"),
        test.expect(fooSource3.fooMethod).to.have.been.calledWith("foo", "foo2", "foo3")
      ]);
    });

    test.it("should not call to sources not tagged with provided tag", () => {
      sources.getByTag("tag-3").call("fooMethod", "foo", "foo2", "foo3");

      return test.expect(fooSource.fooMethod).to.not.have.been.called();
    });

    test.it("should return an array containing results of selected sources", () => {
      test.expect(sources.getByTag("tag-3").call("fooMethod")).to.deep.equal(["foo-2", "foo-3"]);
    });
  });
});
