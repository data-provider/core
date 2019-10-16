const { sources } = require("@xbyorange/mercury");
const Storage = require("./Storage.mock");

const { LocalStorage } = require("../src/LocalStorage");

describe("Local Storage", () => {
  let storage;

  beforeEach(() => {
    storage = new Storage("localStorage");
  });

  afterEach(() => {
    storage.restore();
    sources.clear();
  });

  describe("Available methods", () => {
    it("should have all CRUD methods", () => {
      const userData = new LocalStorage(
        "userData",
        {},
        {
          root: storage.mock
        }
      );
      expect(userData.create).toBeDefined();
      expect(userData.read).toBeDefined();
      expect(userData.update).toBeDefined();
      expect(userData.delete).toBeDefined();
    });

    it("should return a localStorage mock from window if root object is not defined", () => {
      expect.assertions(1);
      const userData = new LocalStorage("userData", {});
      expect(userData._storage.removeItem).toEqual(undefined);
    });
  });

  describe("When window is not available and it uses storage mock", () => {
    let userData;
    const fooData = {
      foo: "foo-value"
    };

    beforeEach(() => {
      userData = new LocalStorage("userData", {});
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
      expect.assertions(1);
      await userData.update(fooData);
      await userData.read();
      expect(userData.read.value).toEqual(fooData);
    });
  });

  describe("Loading property of a method", () => {
    let userData;

    beforeAll(() => {
      userData = new LocalStorage(
        "userData",
        {},
        {
          root: storage.mock
        }
      );
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

    beforeEach(() => {
      storage.stubs.getItem.returns(JSON.stringify(fooData));
      userData = new LocalStorage("userData", undefined, {
        root: storage.mock
      });
    });

    it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
      expect.assertions(2);
      const promise = userData.read();
      expect(userData.read.value).toEqual(undefined);
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
      storage.stubs.getItem.returns(JSON.stringify(fooData));
      userData = new LocalStorage(
        "userData",
        {},
        {
          root: storage.mock
        }
      );
    });
    describe("without query", () => {
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
        expect(storage.stubs.setItem.getCall(0).args[1]).toEqual(JSON.stringify(newValue));
      });
    });

    describe("when queried", () => {
      it("should set the property corresponding to applied query", async () => {
        let queriedData = userData.query("foo");
        await queriedData.update("foo-updated-value");
        expect(storage.stubs.setItem.getCall(0).args[1]).toEqual(
          JSON.stringify({
            foo: "foo-updated-value"
          })
        );
      });

      it("should clean the cache of root when finish successfully", async () => {
        expect.assertions(3);
        let promise = userData.read();
        expect(userData.read.loading).toEqual(true);
        await promise;
        await userData.query("foo").update("");
        promise = userData.read();
        expect(userData.read.loading).toEqual(true);
        return promise.then(() => {
          expect(userData.read.loading).toEqual(false);
        });
      });
    });
  });

  describe("Delete method", () => {
    let userData;
    const fooData = {
      foo: "foo-value"
    };

    beforeEach(() => {
      storage.stubs.getItem.returns(JSON.stringify(fooData));
      userData = new LocalStorage(
        "userData",
        {},
        {
          root: storage.mock
        }
      );
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

    describe("when queried", () => {
      it("should delete the property corresponding to applied query", async () => {
        let queriedData = userData.query("foo");
        await queriedData.delete();
        expect(storage.stubs.setItem.getCall(0).args[1]).toEqual(JSON.stringify({}));
      });
    });
  });

  describe("Create method", () => {
    let userData;
    const fooData = {
      foo: "foo-value"
    };

    beforeEach(() => {
      storage.stubs.getItem.returns(JSON.stringify(fooData));
      userData = new LocalStorage(
        "userData",
        {},
        {
          root: storage.mock
        }
      );
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
      expect(storage.stubs.setItem.getCall(0).args[1]).toEqual(
        JSON.stringify({
          foo: "foo-value",
          foo2: "foo-new"
        })
      );
    });
  });

  describe("Instance tags", () => {
    let fooData;

    describe("when no options are defined", () => {
      beforeEach(() => {
        fooData = new LocalStorage("fooData");
      });

      it("should contain the browser-storage tag", () => {
        expect(sources.getByTag("browser-storage").elements[0]).toEqual(fooData);
      });

      it("should contain the local-storage tag", () => {
        expect(sources.getByTag("local-storage").elements[0]).toEqual(fooData);
      });
    });

    describe("when passing tags", () => {
      it("should contain the local-storage tag even when a custom tag is received", () => {
        const fooData = new LocalStorage(
          "fooData",
          {},
          {
            tags: "foo-tag"
          }
        );
        expect(sources.getByTag("local-storage").elements[0]).toEqual(fooData);
      });

      it("should contain the ocal-storage tag even when an array of custom tags is received", () => {
        const fooData = new LocalStorage(
          "fooData",
          {},
          {
            tags: ["foo-tag", "foo-tag-2"]
          }
        );
        expect(sources.getByTag("local-storage").elements[0]).toEqual(fooData);
      });

      it("should contain defined custom tag if received", () => {
        const FOO_TAG = "foo-tag";
        const fooData = new LocalStorage(
          "fooData",
          {},
          {
            tags: FOO_TAG
          }
        );
        expect(sources.getByTag(FOO_TAG).elements[0]).toEqual(fooData);
      });

      it("should contain defined custom tags if received", () => {
        expect.assertions(2);
        const FOO_TAG = "foo-tag";
        const FOO_TAG_2 = "foo-tag-2";
        const fooData = new LocalStorage(
          "fooData",
          {},
          {
            tags: [FOO_TAG, FOO_TAG_2]
          }
        );
        expect(sources.getByTag(FOO_TAG).elements[0]).toEqual(fooData);
        expect(sources.getByTag(FOO_TAG_2).elements[0]).toEqual(fooData);
      });
    });
  });
});
