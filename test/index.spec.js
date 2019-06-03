const index = require("../src/index");

describe("index", () => {
  it("should export the LocalStorage constructor", () => {
    expect(index.LocalStorage).toBeDefined();
  });

  it("should export the SessionStorage constructor", () => {
    expect(index.SessionStorage).toBeDefined();
  });
});
