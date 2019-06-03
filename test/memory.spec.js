const { Memory } = require("../src/index");

describe("Memory origin", () => {
  describe("Available methods", () => {
    it("should have all CRUD methods", () => {
      const userData = new Memory();
      expect(userData.create).toBeDefined();
      expect(userData.read).toBeDefined();
      expect(userData.update).toBeDefined();
      expect(userData.delete).toBeDefined();
    });
  });

  describe("Loading property of a method", () => {
    let userData;

    beforeAll(() => {
      userData = new Memory();
    });

    it("should be true while resource is being loaded, false when finished", () => {
      expect.assertions(2);
      const promise = userData.read();
      expect(userData.read.loading).toEqual(true);
      return promise.then(() => {
        expect(userData.read.loading).toEqual(false);
      });
    });

    it("should not be loading when request promise is cached", async () => {
      expect.assertions(3);
      await userData.read();
      expect(userData.read.loading).toEqual(false);
      const secondRead = userData.read();
      expect(userData.read.loading).toEqual(false);
      return secondRead.then(() => {
        expect(userData.read.loading).toEqual(false);
      });
    });

    it("should be loading again after cleaning cache", async () => {
      expect.assertions(3);
      await userData.read();
      expect(userData.read.loading).toEqual(false);
      userData.clean();
      const secondRead = userData.read();
      expect(userData.read.loading).toEqual(true);
      return secondRead.then(() => {
        expect(userData.read.loading).toEqual(false);
      });
    });

    it("should be accesible through getter", async () => {
      expect.assertions(1);
      return userData.read().then(() => {
        expect(userData.read.getters.loading()).toEqual(false);
      });
    });
  });

  describe("Value property of a method", () => {
    let userData;
    const fooData = {
      foo: "foo-value"
    };

    beforeEach(async () => {
      userData = new Memory(fooData);
    });

    it("should return default value while resource is being loaded", () => {
      expect.assertions(2);
      const promise = userData.read();
      expect(userData.read.value).toEqual(fooData);
      return promise.then(() => {
        expect(userData.read.value).toEqual(fooData);
      });
    });

    it("should be accesible through getter", async () => {
      expect.assertions(1);
      await userData.read();
      expect(userData.read.getters.value()).toEqual(fooData);
    });

    describe("when queried", () => {
      it("should return the property corresponding to applied query", async () => {
        let queriedData = userData.query("foo");
        const result = await queriedData.read();
        expect(result).toEqual("foo-value");
      });
    });
  });

  describe("Update method", () => {
    let userData;
    const fooData = {
      foo: "foo-value"
    };

    beforeEach(() => {
      userData = new Memory(fooData);
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = userData.read();
      expect(userData.read.loading).toEqual(true);
      await promise;
      await userData.update("");
      promise = userData.read();
      expect(userData.read.loading).toEqual(true);
      return promise.then(() => {
        expect(userData.read.loading).toEqual(false);
      });
    });

    it("should set the new value", async () => {
      const newValue = { foo2: "foo-new-value" };
      await userData.update(newValue);
      const value = await userData.read();
      expect(value).toEqual(newValue);
    });

    describe("when queried", () => {
      it("should set the property corresponding to applied query", async () => {
        let queriedData = userData.query("foo");
        await queriedData.update("foo-updated-value");
        const value = await userData.read();
        expect(value).toEqual({
          foo: "foo-updated-value"
        });
      });
    });
  });

  describe("Delete method", () => {
    let userData;
    const fooData = {
      foo: "foo-value",
      foo2: "foo-value-2"
    };

    beforeEach(() => {
      userData = new Memory(fooData);
    });

    it("should delete the property corresponding to applied query", async () => {
      let queriedData = userData.query("foo");
      await queriedData.delete();
      await userData.read();
      expect(userData.read.value).toEqual({
        foo2: "foo-value-2"
      });
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = userData.read();
      expect(userData.read.loading).toEqual(true);
      await promise;
      await userData.delete();
      promise = userData.read();
      expect(userData.read.loading).toEqual(true);
      return promise.then(() => {
        expect(userData.read.loading).toEqual(false);
      });
    });
  });

  describe("Create method", () => {
    let userData;
    const fooData = {
      foo: "foo-value"
    };

    beforeEach(() => {
      userData = new Memory(fooData);
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = userData.read();
      expect(userData.read.loading).toEqual(true);
      await promise;
      await userData.create("foo-new");
      promise = userData.read();
      expect(userData.read.loading).toEqual(true);
      return promise.then(() => {
        expect(userData.read.loading).toEqual(false);
      });
    });

    it("should add the new key", async () => {
      await userData.query("foo2").create("foo-new");
      const value = await userData.read();
      expect(value).toEqual({
        foo: "foo-value",
        foo2: "foo-new"
      });
    });
  });
});
