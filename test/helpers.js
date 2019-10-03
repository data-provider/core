const test = require("mocha-sinon-chai");

const helpers = require("../src/helpers");

test.describe("helpers", () => {
  test.describe("hash method", () => {
    test.it("should return a unique identifier based on provided string", () => {
      test.expect(helpers.hash("foo")).to.equal("101574");
    });

    test.it("should return alwys same identifier if same string is provided", () => {
      test.expect(helpers.hash("foo-string")).to.equal(helpers.hash("foo-string"));
    });

    test.it("should return different identifier if different strings are provided", () => {
      test.expect(helpers.hash("foo-1")).to.not.equal(helpers.hash("foo-2"));
    });
  });

  test.describe("uniqueId method", () => {
    test.it("should return the hash of provided id and stringified defaultValue", () => {
      test
        .expect(helpers.uniqueId("foo", { foo: "foo" }))
        .to.equal(helpers.hash('foo{"foo":"foo"}'));
    });
  });

  test.describe("queriedUniqueId method", () => {
    test.it("should return concated provided id and query id", () => {
      test.expect(helpers.queriedUniqueId("foo", "foo2")).to.equal("foo-foo2");
    });
  });

  test.describe("seemsToBeSelectorOptions method", () => {
    test.it("should return false if receives undefined", () => {
      test.expect(helpers.seemsToBeSelectorOptions()).to.equal(false);
    });

    test.it("should return false if receives null", () => {
      test.expect(helpers.seemsToBeSelectorOptions(null)).to.equal(false);
    });

    test.it("should return false if receives and array", () => {
      test.expect(helpers.seemsToBeSelectorOptions([])).to.equal(false);
    });

    test.it("should return false if receives and string", () => {
      test.expect(helpers.seemsToBeSelectorOptions("foo")).to.equal(false);
    });

    test.it("should return false if receives and object", () => {
      test.expect(helpers.seemsToBeSelectorOptions({})).to.equal(false);
    });

    test.it(
      "should return true if receives and object with 'defaultValue' property, even when has false value",
      () => {
        test.expect(helpers.seemsToBeSelectorOptions({ defaultValue: false })).to.equal(true);
      }
    );

    test.it("should return true if receives and object with 'defaultValue' property", () => {
      test.expect(helpers.seemsToBeSelectorOptions({ defaultValue: [] })).to.equal(true);
    });

    test.it("should return true if receives and object with 'uuid' property", () => {
      test.expect(helpers.seemsToBeSelectorOptions({ uuid: "foo" })).to.equal(true);
    });
  });
});
