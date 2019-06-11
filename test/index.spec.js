const index = require("../src/index");

describe("index", () => {
  it("should export Prismic", () => {
    expect(index.Prismic).toBeDefined();
  });
});
