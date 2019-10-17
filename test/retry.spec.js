const { sources } = require("@xbyorange/mercury");
const { Api } = require("../src/index");

describe("retry config", () => {
  let apiStatsCallCount;
  let booksError;

  beforeAll(() => {
    sources.getByTag("mocks").config({
      baseUrl: "http://localhost:3100"
    });

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

  afterAll(() => {
    apiStatsCallCount.reset();
  });

  describe("when api GET fails with a 500 error", () => {
    it("should retry 5 times by default", async () => {
      expect.assertions(1);
      try {
        await booksError.read();
      } catch (err) {
        const { callCount } = await apiStatsCallCount.read();
        expect(callCount).toEqual(5);
      }
    });
  });
});
