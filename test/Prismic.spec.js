const PrismicMock = require("./PrismicJs.mock");

const { Prismic } = require("../src/Prismic");

describe("Prismic", () => {
  const fooPrismicUrl = "foo-url";
  let mock;
  let prismic;

  beforeEach(() => {
    mock = new PrismicMock();
    prismic = new Prismic(fooPrismicUrl);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("prismic client instance", () => {
    it("should not be created until read method is called", () => {
      expect(mock.stubs.api.callCount).toEqual(0);
    });

    it("should create only once for each Prismic instance, no matter how many different queries are used", async () => {
      await prismic.read();
      await prismic
        .query({
          documentType: "foo"
        })
        .read();
      expect(mock.stubs.api.callCount).toEqual(1);
    });

    it("should be created with provided url", async () => {
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(fooPrismicUrl);
    });
  });

  describe("when read is dispatched", () => {
    it("should pass release config as ref parameter to prismic client", async () => {
      prismic = new Prismic(fooPrismicUrl, {
        release: "foo-release"
      });
      await prismic.read();
      expect(mock.stubs.apiQuery.getCall(0).args[1]).toEqual({
        ref: "foo-release"
      });
    });

    it("should convert documentType query to prismic client query", async () => {
      mock.stubs.predicates.at.returns("foo-client-query");
      await prismic
        .query({
          documentType: "foo"
        })
        .read();
      expect(mock.stubs.predicates.at.getCall(0).args[1]).toEqual("foo");
      expect(mock.stubs.apiQuery.getCall(0).args[0]).toEqual(["foo-client-query"]);
    });

    it("should resolve with query full response if fullResponse option is true", async () => {
      const fooResponse = {
        results: "foo"
      };
      mock.stubs.apiQuery.resolves(fooResponse);
      prismic.config({
        fullResponse: true
      });
      const result = await prismic.read();
      expect(result).toEqual(fooResponse);
    });

    it("should resolve with query response result property by default", async () => {
      const fooResponse = {
        results: "foo"
      };
      mock.stubs.apiQuery.resolves(fooResponse);
      const result = await prismic.read();
      expect(result).toEqual(fooResponse.results);
    });

    it("should resolve with query response result if fullResponse option is false", async () => {
      const fooResponse = {
        results: "foo"
      };
      prismic.config({
        fullResponse: false
      });
      mock.stubs.apiQuery.resolves(fooResponse);
      const result = await prismic.read();
      expect(result).toEqual(fooResponse.results);
    });

    it("should cache responses for same queries", async () => {
      const fooQuery = "foo";
      await prismic.query(fooQuery).read();
      await prismic.query(fooQuery).read();
      await prismic.query(fooQuery).read();
      expect(mock.stubs.apiQuery.callCount).toEqual(1);
    });

    it("should not cache error responses", async () => {
      mock.stubs.apiQuery.rejects(new Error());
      const fooQuery = "foo";
      try {
        await prismic.query(fooQuery).read();
      } catch (err) {}
      mock.stubs.apiQuery.resolves({ results: {} });
      await prismic.query(fooQuery).read();
      expect(mock.stubs.apiQuery.callCount).toEqual(2);
    });

    it("should reject with received error", async () => {
      const fooError = new Error("foo error");
      let error;
      mock.stubs.apiQuery.rejects(fooError);
      try {
        await prismic.read();
      } catch (err) {
        error = err;
      }
      expect(error).toEqual(fooError);
    });
  });

  describe("config method", () => {
    it("should extend previously defined config", () => {
      expect.assertions(6);
      prismic.config({
        fullResponse: false,
        release: "foo"
      });
      expect(prismic._release).toEqual("foo");
      expect(prismic._fullResponse).toEqual(false);
      prismic.config({
        fullResponse: true
      });
      expect(prismic._release).toEqual("foo");
      expect(prismic._fullResponse).toEqual(true);
      prismic.config({
        release: "foo-release"
      });
      expect(prismic._release).toEqual("foo-release");
      expect(prismic._fullResponse).toEqual(true);
    });
  });
});
