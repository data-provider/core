/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

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

    test.it("should return only one element in elements property", () => {
      new FooOrigin("foo");
      new FooOrigin("foo-2");
      new FooOrigin("foo-3");
      return test.expect(sources.getById("foo").elements.length).to.equal(1);
    });

    test.it(
      "should return only one element in elements property even when id is duplicated",
      () => {
        new FooOrigin("foo");
        new FooOrigin("foo-2");
        new FooOrigin("foo-3");
        new FooOrigin("foo");
        return test.expect(sources.getById("foo").elements.length).to.equal(1);
      }
    );

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
    });
  });
});
