const index = require("../src/index");

describe("index", () => {
  it("should export the Memory constructor", () => {
    expect(index.Memory).toBeDefined();
  });
});
