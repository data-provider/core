const test = require("mocha-sinon-chai");

const { Origin, sources } = require("../src/Origin");
const { Selector } = require("../src/Selector");

test.describe("sources handler", () => {
  const FooOrigin = class extends Origin {
    constructor(id) {
      super(id, null, { uuid: id });
    }

    _read() {
      return Promise.resolve(5);
    }
  };

  test.describe("elements property", () => {
    test.afterEach(() => {
      sources.clear();
    });

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
});
