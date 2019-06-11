const sinon = require("sinon");

const { Api, apis } = require("../src/index");

describe("apis clean method", () => {
  let sandbox;
  let api_1;
  let api_2;
  let api_3;

  beforeAll(() => {
    apis.reset();
    api_1 = new Api("foo-1");
    api_2 = new Api("foo-2", {
      tags: "tag-1"
    });
    api_3 = new Api("foo-3", {
      tags: ["tag-1", "tag-2"]
    });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    api_1.clean = sandbox.spy();
    api_2.clean = sandbox.spy();
    api_3.clean = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(() => {
    apis.reset();
  });

  describe("when calling apis clean method", () => {
    describe("if no tags are defined", () => {
      it("should clean all existant apis", () => {
        apis.clean();
        expect(api_1.clean.called).toEqual(true);
        expect(api_2.clean.called).toEqual(true);
        expect(api_3.clean.called).toEqual(true);
      });
    });

    describe("if tag is defined as string", () => {
      it("should clean all existant apis having a tag matching with it", () => {
        apis.clean("tag-1");
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(true);
        expect(api_3.clean.called).toEqual(true);
      });

      it("should not clean any api if any have a matching tag", () => {
        apis.clean("tag-foo");
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(false);
        expect(api_3.clean.called).toEqual(false);
      });
    });

    describe("if tag is an array", () => {
      it("should clean all existant apis having a tag matching with any of it", () => {
        apis.clean(["tag-1", "foo"]);
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(true);
        expect(api_3.clean.called).toEqual(true);
      });

      it("should not clean any api if any have a matching tag", () => {
        apis.clean(["tag-foo", "foo"]);
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(false);
        expect(api_3.clean.called).toEqual(false);
      });
    });
  });
});
