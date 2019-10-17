const { sources } = require("@xbyorange/mercury");
const { Api } = require("../src/index");

describe("retry config", () => {
  let apiStatsCallCount;
  let apiStatsReset;
  let booksServerError;

  beforeAll(async () => {
    sources.getByTag("mocks").config({
      baseUrl: "http://localhost:3100"
    });

    apiStatsReset = new Api("/api/stats/reset", {
      tags: "mocks"
    });
    await apiStatsReset.create();

    apiStatsCallCount = new Api("/api/stats/call-count", {
      cache: false,
      tags: "mocks"
    });

    booksServerError = new Api("/api/books/server-error", {
      defaultValue: [],
      tags: "mocks"
    });
  });

  afterEach(async () => {
    await apiStatsReset.create();
  });

  describe("when api GET fails with a 500 error", () => {
    it("should retry 3 times by default", async () => {
      expect.assertions(1);
      try {
        await booksServerError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.serverError).toEqual(4);
      }
    });
  });

  describe("when api GET fails with a 404 error", () => {
    it("should not retry", async () => {
      const booksNotFoundError = new Api("/api/books/not-found-error", {
        tags: "mocks"
      });
      expect.assertions(1);
      try {
        await booksNotFoundError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.notFoundError).toEqual(1);
      }
    });
  });
});
