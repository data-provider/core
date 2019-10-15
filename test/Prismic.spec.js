/* global describe, beforeEach, afterEach, it, expect  */

const { sources } = require("@xbyorange/mercury");

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

    it("should override previously defined url", async () => {
      expect.assertions(1);
      const FOO_NEW_URL = "foo-prismic-url-2";
      prismic.config({
        url: FOO_NEW_URL
      });
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(FOO_NEW_URL);
    });

    it("should override previously defined url when using mercury sources handler", async () => {
      expect.assertions(1);
      const FOO_NEW_URL = "foo-prismic-url-2";
      sources.getByTag("prismic").config({
        url: FOO_NEW_URL
      });
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(FOO_NEW_URL);
    });

    it("should override previously defined url when using mercury sources handler even when source has its own tag defined", async () => {
      expect.assertions(1);
      prismic = new Prismic(fooPrismicUrl, {
        tags: "foo-tag"
      });
      const FOO_NEW_URL = "foo-prismic-url-3";
      sources.getByTag("prismic").config({
        url: FOO_NEW_URL
      });
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(FOO_NEW_URL);
    });

    it("should override previously defined url when using mercury sources handler even when source has its own prismic tag defined", async () => {
      expect.assertions(1);
      prismic = new Prismic(fooPrismicUrl, {
        tags: "prismic"
      });
      const FOO_NEW_URL = "foo-prismic-url-3";
      sources.getByTag("prismic").config({
        url: FOO_NEW_URL
      });
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(FOO_NEW_URL);
    });

    it("should work when using mercury sources handler even when source has its own tags defined", async () => {
      expect.assertions(1);
      prismic = new Prismic(fooPrismicUrl, {
        tags: ["foo-tag", "foo-tag-2"]
      });
      const FOO_NEW_URL = "foo-prismic-url-4";
      sources.getByTag("prismic").config({
        url: FOO_NEW_URL
      });
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(FOO_NEW_URL);
    });

    it("should work when using mercury sources handler and specific tags", async () => {
      expect.assertions(1);
      prismic = new Prismic(fooPrismicUrl, {
        tags: "foo-tag"
      });
      const FOO_NEW_URL = "foo-prismic-url-5";
      sources.getByTag("foo-tag").config({
        url: FOO_NEW_URL
      });
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(FOO_NEW_URL);
    });

    it("should work when using mercury sources handler and an specific tag that is present in defined tags", async () => {
      expect.assertions(1);
      prismic = new Prismic(fooPrismicUrl, {
        tags: ["foo-tag", "foo-tag-3"]
      });
      const FOO_NEW_URL = "foo-prismic-url-5";
      sources.getByTag("foo-tag-3").config({
        url: FOO_NEW_URL
      });
      await prismic.read();
      expect(mock.stubs.api.getCall(0).args[0]).toEqual(FOO_NEW_URL);
    });
  });
});
