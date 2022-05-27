const index = require("../src/index");

describe("index", () => {
  it("should export useRefresh", () => {
    expect(index.useRefresh).toBeDefined();
  });
});
