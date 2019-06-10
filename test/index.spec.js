const index = require("../src/index");

describe("index", () => {
  it("should export Api", () => {
    expect(index.Api).toBeDefined();
  });

  it("should export apis handler", () => {
    expect(index.apis).toBeDefined();
  });
});
