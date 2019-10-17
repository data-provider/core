const { sources } = require("@xbyorange/mercury");
const { Api } = require("../src/index");

describe("retry config", () => {
  let apiStatsCallCount;
  let apiStatsReset;
  let booksError;

  beforeAll(async () => {
    sources.getByTag("mocks").config({
      baseUrl: "http://localhost:3100"
    });

    apiStatsReset = new Api("/api/stats/reset", {
      tags: "mocks"
    });
    await apiStatsReset.create();

    apiStatsCallCount = new Api("/api/stats/call-count", {
      defaultValue: {
        callCount: 0
      },
      tags: "mocks"
    });

    booksError = new Api("/api/books/error", {
      defaultValue: [],
      tags: "mocks"
    });
  });

  afterAll(async () => {
    await apiStatsReset.create();
  });

  describe("when api GET fails with a 500 error", () => {
    it("should retry 4 times by default", async () => {
      expect.assertions(1);
      try {
        await booksError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.error).toEqual(4);
      }
    });
  });
});
