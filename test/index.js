const test = require("mocha-sinon-chai");

const index = require("../src/index");

test.describe("index", () => {
  test.it("should export Origin", () => {
    test.expect(index.Origin).to.not.be.undefined();
  });

  test.it("should export Selector", () => {
    test.expect(index.Selector).to.not.be.undefined();
  });
});
