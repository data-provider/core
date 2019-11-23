/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("sources handler clean method", () => {
  const FooOrigin = class extends Origin {
    constructor(id, tags) {
      super(id, null, { uuid: id, tags });
    }

    _read() {
      return Promise.resolve(5);
    }
  };
  let sandbox;
  let fooSource;
  let fooSource2;
  let fooSource3;
  let fooSource4;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    fooSource = new FooOrigin("foo-1", "tag-1");
    fooSource2 = new FooOrigin("foo-2", ["tag-2", "tag-3"]);
    fooSource3 = new FooOrigin("foo-3", "tag-3");
    fooSource4 = new Selector(fooSource, fooSource2, () => {}, {
      uuid: "foo-4",
      tags: "tag-2"
    });

    sandbox.spy(fooSource, "clean");
    sandbox.spy(fooSource2, "clean");
    sandbox.spy(fooSource3, "clean");
    sandbox.spy(fooSource4, "clean");
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("when applied to all sources", () => {
    test.it("should call to clean method of all sources", () => {
      sources.clean();

      return Promise.all([
        test.expect(fooSource.clean).to.have.been.called(),
        test.expect(fooSource2.clean).to.have.been.called(),
        test.expect(fooSource3.clean).to.have.been.called(),
        test.expect(fooSource4.clean).to.have.been.called()
      ]);
    });
  });

  test.describe("when used with getById", () => {
    test.it("should call to clean method only of selected sources", () => {
      sources.getById("foo-2").clean();

      return Promise.all([
        test.expect(fooSource.clean).to.not.have.been.called(),
        test.expect(fooSource2.clean).to.have.been.called(),
        test.expect(fooSource3.clean).to.not.have.been.called(),
        test.expect(fooSource4.clean).to.not.have.been.called()
      ]);
    });
  });

  test.describe("when used with getByTag", () => {
    test.it("should call to clean method only of selected sources", () => {
      sources.getByTag("tag-2").clean();

      return Promise.all([
        test.expect(fooSource.clean).to.not.have.been.called(),
        test.expect(fooSource2.clean).to.have.been.called(),
        test.expect(fooSource3.clean).to.not.have.been.called(),
        test.expect(fooSource4.clean).to.have.been.called()
      ]);
    });

    test.it("should call to clean method of all selected sources", () => {
      sources.getByTag("tag-3").clean();

      return Promise.all([
        test.expect(fooSource.clean).to.not.have.been.called(),
        test.expect(fooSource2.clean).to.have.been.called(),
        test.expect(fooSource3.clean).to.have.been.called(),
        test.expect(fooSource4.clean).to.not.have.been.called()
      ]);
    });
  });
});
