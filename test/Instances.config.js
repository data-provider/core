/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const { Provider, instances } = require("../src/Provider");

test.describe("instances handler config method", () => {
  const FooProvider = class extends Provider {
    constructor(id, tags) {
      super(id, null, { uuid: id, tags });
    }

    _read() {
      return Promise.resolve();
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
  });

  test.afterEach(() => {
    sandbox.restore();
    instances.clear();
  });

  test.describe("when applied to all instances", () => {
    test.it("should apply config to all instances", () => {
      instances.config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooProvider._configuration.foo).to.equal("foo"),
        test.expect(fooProvider2._configuration.foo).to.equal("foo"),
        test.expect(fooProvider3._configuration.foo).to.equal("foo")
      ]);
    });

    test.it("should extend current configuration of all instances", () => {
      instances.config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooProvider._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooProvider2._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-2", "tag-3"],
          uuid: "foo-2"
        }),
        test.expect(fooProvider3._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-3"],
          uuid: "foo-3"
        })
      ]);
    });

    test.it("should be applied to new created instances", () => {
      instances.config({
        foo: "foo"
      });

      const fooProvider4 = new FooProvider("foo-4");

      return Promise.all([
        test.expect(fooProvider4._configuration).to.deep.equal({
          foo: "foo",
          tags: [],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should extend previously defined configuration", () => {
      instances.config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooProvider4 = new FooProvider("foo-4");

      instances.config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return Promise.all([
        test.expect(fooProvider._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooProvider4._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: [],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should call to instances _config method with the resultant configuration", () => {
      const fooProvider4 = new FooProvider("foo-4");
      fooProvider4._config = sandbox.stub();

      instances.config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return test.expect(fooProvider4._config).to.have.been.calledWith({
        foo2: "new-foo2",
        foo3: "foo3",
        tags: [],
        uuid: "foo-4"
      });
    });
  });

  test.describe("when applied to groups of instances using getByTag method", () => {
    test.it("should apply config to all instances in group", () => {
      instances.getByTag("tag-3").config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooProvider2._configuration.foo).to.equal("foo"),
        test.expect(fooProvider3._configuration.foo).to.equal("foo")
      ]);
    });

    test.it("should not apply config to non-belonging instances", () => {
      instances.getByTag("tag-3").config({
        foo: "foo"
      });

      return test.expect(fooProvider._configuration.foo).to.equal(undefined);
    });

    test.it("should extend current configuration of all instances belonging to group", () => {
      instances.getByTag("tag-3").config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooProvider._configuration).to.deep.equal({
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooProvider2._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-2", "tag-3"],
          uuid: "foo-2"
        }),
        test.expect(fooProvider3._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-3"],
          uuid: "foo-3"
        })
      ]);
    });

    test.it("should be applied to new created instances", () => {
      instances.getByTag("tag-4").config({
        foo: "foo"
      });

      const fooProvider4 = new FooProvider("foo-4", "tag-4");

      return Promise.all([
        test.expect(fooProvider4._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-4"],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should be applied to new created instances containing tag", () => {
      instances.getByTag("tag-4").config({
        foo: "foo"
      });

      const fooProvider4 = new FooProvider("foo-4", ["tag-4", "tag-2"]);

      return Promise.all([
        test.expect(fooProvider4._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-4", "tag-2"],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should extend previously defined configuration", () => {
      instances.getByTag("tag-3").config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooProvider4 = new FooProvider("foo-4", "tag-3");

      instances.getByTag("tag-3").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return Promise.all([
        test.expect(fooProvider._configuration).to.deep.equal({
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooProvider2._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-2", "tag-3"],
          uuid: "foo-2"
        }),
        test.expect(fooProvider3._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-3"],
          uuid: "foo-3"
        }),
        test.expect(fooProvider4._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-3"],
          uuid: "foo-4"
        })
      ]);
    });

    test.it(
      "should extend previously defined configuration when creating source containing tag",
      () => {
        instances.getByTag("tag-3").config({
          foo: "foo",
          foo2: "foo2"
        });

        const fooProvider4 = new FooProvider("foo-4", ["tag-3", "tag-5"]);

        instances.getByTag("tag-3").config({
          foo2: "new-foo2",
          foo3: "foo3"
        });

        return test.expect(fooProvider4._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-3", "tag-5"],
          uuid: "foo-4"
        });
      }
    );

    test.it("should call to instances _config method with the resultant configuration", () => {
      const fooProvider4 = new FooProvider("foo-4", "tag-4");
      fooProvider4._config = sandbox.stub();

      instances.getByTag("tag-4").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return test.expect(fooProvider4._config).to.have.been.calledWith({
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-4"],
        uuid: "foo-4"
      });
    });
  });

  test.describe("when applied to groups of instances using getById method", () => {
    test.it("should apply config to source with id", () => {
      instances.getById("foo-2").config({
        foo: "foo"
      });

      return test.expect(fooProvider2._configuration.foo).to.equal("foo");
    });

    test.it("should not apply config to non-belonging instances", () => {
      instances.getById("foo-2").config({
        foo: "foo"
      });

      return test.expect(fooProvider._configuration.foo).to.equal(undefined);
    });

    test.it("should extend current configuration of instance with provided id", () => {
      instances.getById("foo-3").config({
        foo: "foo"
      });

      return test.expect(fooProvider3._configuration).to.deep.equal({
        foo: "foo",
        tags: ["tag-3"],
        uuid: "foo-3"
      });
    });

    test.it("should be applied to new created instances tagged with same tag", () => {
      instances.getById("foo-4").config({
        foo: "foo"
      });

      const fooProvider4 = new FooProvider("foo-4", "tag-4");

      return Promise.all([
        test.expect(fooProvider4._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-4"],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should extend previously defined configuration", () => {
      instances.getById("foo-4").config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooProvider4 = new FooProvider("foo-4", "tag-4");

      instances.getById("foo-4").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return test.expect(fooProvider4._configuration).to.deep.equal({
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-4"],
        uuid: "foo-4"
      });
    });

    test.it("should call to instances _config method with the resultant configuration", () => {
      const fooProvider4 = new FooProvider("foo-4", "tag-4");
      fooProvider4._config = sandbox.stub();

      instances.getById("foo-4").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return test.expect(fooProvider4._config).to.have.been.calledWith({
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-4"],
        uuid: "foo-4"
      });
    });
  });
});
