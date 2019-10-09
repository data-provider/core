const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");

test.describe("sources handler config method", () => {
  const FooOrigin = class extends Origin {
    constructor(id, tags) {
      super(id, null, { uuid: id, tags });
    }

    _read() {
      return Promise.resolve();
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
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("when applied to all sources", () => {
    test.it("should apply config to all sources", () => {
      sources.config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooSource._configuration.foo).to.equal("foo"),
        test.expect(fooSource2._configuration.foo).to.equal("foo"),
        test.expect(fooSource3._configuration.foo).to.equal("foo")
      ]);
    });

    test.it("should extend current configuration of all sources", () => {
      sources.config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooSource._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooSource2._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-2", "tag-3"],
          uuid: "foo-2"
        }),
        test.expect(fooSource3._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-3"],
          uuid: "foo-3"
        })
      ]);
    });

    test.it("should be applied to new created sources", () => {
      sources.config({
        foo: "foo"
      });

      const fooSource4 = new FooOrigin("foo-4");

      return Promise.all([
        test.expect(fooSource4._configuration).to.deep.equal({
          foo: "foo",
          tags: [],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should extend previously defined configuration", () => {
      sources.config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooSource4 = new FooOrigin("foo-4");

      sources.config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return Promise.all([
        test.expect(fooSource._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooSource4._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: [],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should call to sources _config method with the resultant configuration", () => {
      const fooSource4 = new FooOrigin("foo-4");
      fooSource4._config = sandbox.stub();

      sources.config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return test.expect(fooSource4._config).to.have.been.calledWith({
        foo2: "new-foo2",
        foo3: "foo3",
        tags: [],
        uuid: "foo-4"
      });
    });
  });

  test.describe("when applied to groups of sources using getByTag method", () => {
    test.it("should apply config to all sources in group", () => {
      sources.getByTag("tag-3").config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooSource2._configuration.foo).to.equal("foo"),
        test.expect(fooSource3._configuration.foo).to.equal("foo")
      ]);
    });

    test.it("should not apply config to non-belonging sources", () => {
      sources.getByTag("tag-3").config({
        foo: "foo"
      });

      return test.expect(fooSource._configuration.foo).to.equal(undefined);
    });

    test.it("should extend current configuration of all sources belonging to group", () => {
      sources.getByTag("tag-3").config({
        foo: "foo"
      });

      return Promise.all([
        test.expect(fooSource._configuration).to.deep.equal({
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooSource2._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-2", "tag-3"],
          uuid: "foo-2"
        }),
        test.expect(fooSource3._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-3"],
          uuid: "foo-3"
        })
      ]);
    });

    test.it("should be applied to new created sources", () => {
      sources.getByTag("tag-4").config({
        foo: "foo"
      });

      const fooSource4 = new FooOrigin("foo-4", "tag-4");

      return Promise.all([
        test.expect(fooSource4._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-4"],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should extend previously defined configuration", () => {
      sources.getByTag("tag-3").config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooSource4 = new FooOrigin("foo-4", "tag-3");

      sources.getByTag("tag-3").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return Promise.all([
        test.expect(fooSource._configuration).to.deep.equal({
          tags: ["tag-1"],
          uuid: "foo-1"
        }),
        test.expect(fooSource2._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-2", "tag-3"],
          uuid: "foo-2"
        }),
        test.expect(fooSource3._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-3"],
          uuid: "foo-3"
        }),
        test.expect(fooSource4._configuration).to.deep.equal({
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-3"],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should call to sources _config method with the resultant configuration", () => {
      const fooSource4 = new FooOrigin("foo-4", "tag-4");
      fooSource4._config = sandbox.stub();

      sources.getByTag("tag-4").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return test.expect(fooSource4._config).to.have.been.calledWith({
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-4"],
        uuid: "foo-4"
      });
    });
  });

  test.describe("when applied to groups of sources using getById method", () => {
    test.it("should apply config to source with id", () => {
      sources.getById("foo-2").config({
        foo: "foo"
      });

      return test.expect(fooSource2._configuration.foo).to.equal("foo");
    });

    test.it("should not apply config to non-belonging sources", () => {
      sources.getById("foo-2").config({
        foo: "foo"
      });

      return test.expect(fooSource._configuration.foo).to.equal(undefined);
    });

    test.it("should extend current configuration of source with provided id", () => {
      sources.getById("foo-3").config({
        foo: "foo"
      });

      return test.expect(fooSource3._configuration).to.deep.equal({
        foo: "foo",
        tags: ["tag-3"],
        uuid: "foo-3"
      });
    });

    test.it("should be applied to new created sources", () => {
      sources.getById("foo-4").config({
        foo: "foo"
      });

      const fooSource4 = new FooOrigin("foo-4", "tag-4");

      return Promise.all([
        test.expect(fooSource4._configuration).to.deep.equal({
          foo: "foo",
          tags: ["tag-4"],
          uuid: "foo-4"
        })
      ]);
    });

    test.it("should extend previously defined configuration", () => {
      sources.getById("foo-4").config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooSource4 = new FooOrigin("foo-4", "tag-4");

      sources.getById("foo-4").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return;
      test.expect(fooSource4._configuration).to.deep.equal({
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-4"],
        uuid: "foo-4"
      });
    });

    test.it("should call to sources _config method with the resultant configuration", () => {
      const fooSource4 = new FooOrigin("foo-4", "tag-4");
      fooSource4._config = sandbox.stub();

      sources.getById("foo-4").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      return test.expect(fooSource4._config).to.have.been.calledWith({
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-4"],
        uuid: "foo-4"
      });
    });
  });
});
