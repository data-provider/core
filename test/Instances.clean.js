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

test.describe("instances handler clean method", () => {
  const FooProvider = class extends Provider {
    constructor(id, tags) {
      super(id, null, { uuid: id, tags });
    }

    _read() {
      return Promise.resolve(5);
    }
  };
  let sandbox;
  let fooProvider;
  let fooProvider2;
  let fooProvider3;
  let fooProvider4;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    fooProvider = new FooProvider("foo-1", "tag-1");
    fooProvider2 = new FooProvider("foo-2", ["tag-2", "tag-3"]);
    fooProvider3 = new FooProvider("foo-3", "tag-3");
    fooProvider4 = new Selector(fooProvider, fooProvider2, () => {}, {
      uuid: "foo-4",
      tags: "tag-2"
    });

    sandbox.spy(fooProvider, "clean");
    sandbox.spy(fooProvider2, "clean");
    sandbox.spy(fooProvider3, "clean");
    sandbox.spy(fooProvider4, "clean");
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("when applied to all instances", () => {
    test.it("should call to clean method of all instances", () => {
      instances.clean();

      return Promise.all([
        test.expect(fooProvider.clean).to.have.been.called(),
        test.expect(fooProvider2.clean).to.have.been.called(),
        test.expect(fooProvider3.clean).to.have.been.called(),
        test.expect(fooProvider4.clean).to.have.been.called()
      ]);
    });
  });

  test.describe("when used with getById", () => {
    test.it("should call to clean method only of selected instances", () => {
      instances.getById("foo-2").clean();

      return Promise.all([
        test.expect(fooProvider.clean).to.not.have.been.called(),
        test.expect(fooProvider2.clean).to.have.been.called(),
        test.expect(fooProvider3.clean).to.not.have.been.called(),
        test.expect(fooProvider4.clean).to.not.have.been.called()
      ]);
    });
  });

  test.describe("when used with getByTag", () => {
    test.it("should call to clean method only of selected instances", () => {
      instances.getByTag("tag-2").clean();

      return Promise.all([
        test.expect(fooProvider.clean).to.not.have.been.called(),
        test.expect(fooProvider2.clean).to.have.been.called(),
        test.expect(fooProvider3.clean).to.not.have.been.called(),
        test.expect(fooProvider4.clean).to.have.been.called()
      ]);
    });

    test.it("should call to clean method of all selected instances", () => {
      instances.getByTag("tag-3").clean();

      return Promise.all([
        test.expect(fooProvider.clean).to.not.have.been.called(),
        test.expect(fooProvider2.clean).to.have.been.called(),
        test.expect(fooProvider3.clean).to.have.been.called(),
        test.expect(fooProvider4.clean).to.not.have.been.called()
      ]);
    });
  });
});
