const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("sources handler", () => {
  const FooOrigin = class extends Origin {
    constructor(id, tags) {
      super(id, null, { uuid: id, tags });
    }

    _read() {
      return Promise.resolve(5);
    }
  };
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
    sources.clear();
  });

  test.describe("add method", () => {
    test.beforeEach(() => {
      sandbox.stub(console, "warn");
    });

    test.it("should print a trace when duplicated id is detected", () => {
      new FooOrigin("foo-id");
      new FooOrigin("foo-id");
      test.expect(console.warn.getCall(0).args[0]).to.contain("foo-id");
    });
  });

  test.describe("elements getter", () => {
    test.it("should be empty if no sources have been created", () => {
      test.expect(sources.elements.length).to.equal(0);
    });

    test.it("should contain new created sources", () => {
      new FooOrigin("foo-id");
      test.expect(sources.elements[0]._id).to.equal("foo-id");
    });

    test.it("should contain as much elements as sources have been created", () => {
      const fooOrigin = new FooOrigin("foo-id");
      new Selector(fooOrigin, () => {}, {
        uuid: "foo-id-2"
      });
      return Promise.all([
        test.expect(sources.elements[0]._id).to.equal("foo-id"),
        test.expect(sources.elements[1]._id).to.equal("foo-id-2")
      ]);
    });
  });

  test.describe("size getter", () => {
    test.it("should be zero if no sources have been created", () => {
      return test.expect(sources.size).to.equal(0);
    });

    test.it("should contain new created sources", () => {
      new FooOrigin();
      return test.expect(sources.size).to.equal(1);
    });

    test.it("should contain as much elements as sources have been created", () => {
      const fooOrigin = new FooOrigin();
      new Selector(fooOrigin, () => {});
      return test.expect(sources.size).to.equal(2);
    });
  });

  test.describe("getById method", () => {
    test.it("should return handler of source with provided id", () => {
      new FooOrigin("foo");
      const origin = new FooOrigin("foo-id");
      return test.expect(sources.getById("foo-id").elements[0]).to.equal(origin);
    });

    test.it("should return only one element", () => {
      new FooOrigin("foo");
      new FooOrigin("foo-2");
      new FooOrigin("foo-3");
      return test.expect(sources.getById("foo").size).to.equal(1);
    });

    test.it("should not return an empty handler when id does not exist", () => {
      new FooOrigin("foo");
      new FooOrigin("foo-2");
      new FooOrigin("foo-3");
      return test.expect(sources.getById("foo-id").size).to.equal(0);
    });

    test.it("should return last element created when there is an id conflict", () => {
      new FooOrigin("foo");
      new FooOrigin("foo-id");
      const fooOrigin = new FooOrigin("foo-id");
      return test.expect(sources.getById("foo-id").elements[0]).to.equal(fooOrigin);
    });
  });

  test.describe("getByTag method", () => {
    test.describe("when filtering only by one tag", () => {
      test.it("should return handler containing sources with provided tag", () => {
        const TAG = "foo-tag-2";
        new FooOrigin("foo", ["foo-tag"]);
        const origin = new FooOrigin("foo-2", TAG);
        const origin2 = new FooOrigin("foo-3", [TAG, "foo-tag-3"]);
        return Promise.all([
          test.expect(sources.getByTag(TAG).size).to.equal(2),
          test.expect(sources.getByTag(TAG).elements[0]).to.equal(origin),
          test.expect(sources.getByTag(TAG).elements[1]).to.equal(origin2)
        ]);
      });

      test.it("should return empty handler if no sources contain provided tag", () => {
        new FooOrigin("foo", ["foo-tag"]);
        new FooOrigin("foo-2", "foo-tag-2");
        new FooOrigin("foo-3", ["foo-tag-2", "foo-tag-3"]);
        return test.expect(sources.getByTag("foo-unexistant-tag").size).to.equal(0);
      });

      test.it(
        "should return handler containing sources with provided tag when using getByTags alias",
        () => {
          const TAG_1 = "foo-tag-1";
          const TAG_2 = "foo-tag-2";

          new FooOrigin("foo-1", ["foo-tag-3"]);
          new FooOrigin("foo-2", "foo-tag-4");
          const origin = new FooOrigin("foo-3", [TAG_1, "foo-tag-3"]);
          new FooOrigin("foo-4", ["foo-tag-4", TAG_2]);

          const result = sources.getByTags(TAG_1);

          return Promise.all([
            test.expect(result.size).to.equal(1),
            test.expect(result.elements[0]).to.equal(origin)
          ]);
        }
      );
    });

    test.describe("when filtering by many tags", () => {
      test.it("should return handler containing sources with any of the provided tags", () => {
        const TAG_1 = "foo-tag-1";
        const TAG_2 = "foo-tag-2";

        new FooOrigin("foo-1", ["foo-tag-3"]);
        new FooOrigin("foo-2", "foo-tag-4");
        const origin = new FooOrigin("foo-3", [TAG_1, "foo-tag-3"]);
        const origin2 = new FooOrigin("foo-4", ["foo-tag-4", TAG_2]);

        const result = sources.getByTag([TAG_1, TAG_2]);

        return Promise.all([
          test.expect(result.size).to.equal(2),
          test.expect(result.elements[0]).to.equal(origin),
          test.expect(result.elements[1]).to.equal(origin2)
        ]);
      });
    });

    test.describe("when refiltering by many tags", () => {
      test.it(
        "should return handler containing sources with any of provided tags, and any of the second group of tags",
        () => {
          const TAG_1 = "foo-tag-1";
          const TAG_2 = "foo-tag-2";

          new FooOrigin("foo-1", ["foo-tag-3"]);
          new FooOrigin("foo-2", "foo-tag-4");
          const origin = new FooOrigin("foo-3", [TAG_1, "foo-tag-3"]);
          const origin2 = new FooOrigin("foo-4", ["foo-tag-4", TAG_2]);

          const result = sources.getByTag([TAG_1, TAG_2]).getByTag(["foo-tag-3", "foo-tag-4"]);

          return Promise.all([
            test.expect(result.size).to.equal(2),
            test.expect(result.elements[0]).to.equal(origin),
            test.expect(result.elements[1]).to.equal(origin2)
          ]);
        }
      );
    });

    test.describe("when refiltering by many tags", () => {
      test.it(
        "should return handler containing sources with any of provided tags, and any of the second group of tags",
        () => {
          const TAG_1 = "foo-tag-1";
          const TAG_2 = "foo-tag-2";

          new FooOrigin("foo-1", ["foo-tag-3"]);
          new FooOrigin("foo-2", "foo-tag-4");
          const origin = new FooOrigin("foo-3", [TAG_1, "foo-tag-3"]);
          new FooOrigin("foo-4", ["foo-tag-4", TAG_2]);

          const result = sources.getByTag([TAG_1, TAG_2]).getByTag(["foo-tag-3"]);

          return Promise.all([
            test.expect(result.size).to.equal(1),
            test.expect(result.elements[0]).to.equal(origin)
          ]);
        }
      );
    });
  });
});
