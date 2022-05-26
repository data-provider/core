/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const Storage = require("./Storage.mock");

const { SessionStorage } = require("../src/SessionStorage");

describe("SessionStorage Storage", () => {
  let storage;

  beforeEach(() => {
    storage = new Storage("sessionStorage");
  });

  afterEach(() => {
    storage.restore();
    providers.clear();
  });

  describe("Available methods", () => {
    it("should have all CRUD methods", () => {
      const userData = new SessionStorage({ id: "userData", root: storage.mock });
      expect(userData.read).toBeDefined();
      expect(userData.update).toBeDefined();
      expect(userData.delete).toBeDefined();
    });

    it("should return a sessionStorage mock from window if root object is not defined", () => {
      expect.assertions(1);
      const userData = new SessionStorage({ id: "userData" });
      expect(userData._storage.removeItem).toEqual(undefined);
    });
  });

  describe("Tags", () => {
    it("should contain memory tag", () => {
      const userData = new SessionStorage({ id: "userData", root: storage.mock });
      expect(userData._tags).toContain("session-storage");
    });
  });

  describe("When window is not available and it uses storage mock", () => {
    let userData;
    const fooData = {
      foo: "foo-value",
    };

    beforeEach(() => {
      userData = new SessionStorage({ id: "userData" });
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = userData.read();
      expect(userData.state.loading).toEqual(true);
      await promise;
      await userData.update("");
      promise = userData.read();
      expect(userData.state.loading).toEqual(true);
      return promise.then(() => {
        expect(userData.state.loading).toEqual(false);
      });
    });

    it("should set the new value", async () => {
      expect.assertions(1);
      await userData.update(fooData);
      await userData.read();
      expect(userData.state.data).toEqual(fooData);
    });
  });

  describe("Loading property of a method", () => {
    let userData;

    beforeEach(() => {
      userData = new SessionStorage({ id: "userData", root: storage.mock });
    });

    it("should be true while resource is being loaded, false when finished", () => {
      expect.assertions(2);
      const promise = userData.read();
      expect(userData.state.loading).toEqual(true);
      return promise.then(() => {
        expect(userData.state.loading).toEqual(false);
      });
    });

    it("should not be loading when request promise is cached", async () => {
      expect.assertions(3);
      await userData.read();
      expect(userData.state.loading).toEqual(false);
      const secondRead = userData.read();
      expect(userData.state.loading).toEqual(false);
      return secondRead.then(() => {
        expect(userData.state.loading).toEqual(false);
      });
    });

    it("should be loading again after cleaning cache", async () => {
      expect.assertions(3);
      await userData.read();
      expect(userData.state.loading).toEqual(false);
      userData.cleanCache();
      const secondRead = userData.read();
      expect(userData.state.loading).toEqual(true);
      return secondRead.then(() => {
        expect(userData.state.loading).toEqual(false);
      });
    });
  });

  describe("Data property of a method", () => {
    let userData;
    const fooData = {
      foo: "foo-value",
    };

    beforeEach(() => {
      storage.stubs.getItem.returns(JSON.stringify(fooData));
      userData = new SessionStorage({ id: "userData", root: storage.mock });
    });

    describe("browserStorage key", () => {
      it("should be the provider id", async () => {
        await userData.read();
        expect(storage.stubs.getItem.getCall(0).args[0]).toEqual("userData");
      });
    });

    describe("without query", () => {
      it("should be sessionStorage value while resource is being loaded", () => {
        expect.assertions(2);
        const promise = userData.read();
        expect(userData.state.data).toEqual(fooData);
        return promise.then(() => {
          expect(userData.state.data).toEqual(fooData);
        });
      });
    });

    describe("when queried", () => {
      it("should return the property corresponding to applied query", async () => {
        let queriedData = userData.query({ prop: "foo" });
        const result = await queriedData.read();
        expect(result).toEqual("foo-value");
      });

      it("should return default value correspondent to query while resource is being loaded", () => {
        expect.assertions(2);
        userData = new SessionStorage({ id: "userData", root: storage.mock });
        let queriedData = userData.query({ prop: "foo" });
        const promise = queriedData.read();
        expect(queriedData.state.data).toEqual(fooData.foo);
        return promise.then(() => {
          expect(queriedData.state.data).toEqual(fooData.foo);
        });
      });
    });
  });

  describe("Update method", () => {
    let userData;
    const fooData = {
      foo: "foo-value",
    };

    beforeEach(() => {
      storage.stubs.getItem.returns(JSON.stringify(fooData));
      userData = new SessionStorage({ id: "userData", root: storage.mock });
    });

    describe("browserStorage key", () => {
      it("should be the provider id", async () => {
        await userData.update("");
        expect(storage.stubs.setItem.getCall(0).args[0]).toEqual("userData");
      });
    });

    describe("without query", () => {
      it("should clean the cache when finish successfully", async () => {
        expect.assertions(3);
        let promise = userData.read();
        expect(userData.state.loading).toEqual(true);
        await promise;
        await userData.update("");
        promise = userData.read();
        expect(userData.state.loading).toEqual(true);
        return promise.then(() => {
          expect(userData.state.loading).toEqual(false);
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
        let queriedData = userData.query({ prop: "foo" });
        await queriedData.update("foo-updated-value");
        expect(storage.stubs.setItem.getCall(0).args[1]).toEqual(
          JSON.stringify({
            foo: "foo-updated-value",
          })
        );
      });

      it("should clean the cache of root when finish successfully", async () => {
        expect.assertions(3);
        let promise = userData.read();
        expect(userData.state.loading).toEqual(true);
        await promise;
        await userData.query({ prop: "foo" }).update("");
        promise = userData.read();
        expect(userData.state.loading).toEqual(true);
        return promise.then(() => {
          expect(userData.state.loading).toEqual(false);
        });
      });
    });
  });

  describe("Delete method", () => {
    let userData;
    const fooData = {
      foo: "foo-value",
    };

    beforeEach(() => {
      storage.stubs.getItem.returns(JSON.stringify(fooData));
      userData = new SessionStorage({ id: "userData", root: storage.mock });
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = userData.read();
      expect(userData.state.loading).toEqual(true);
      await promise;
      await userData.delete();
      promise = userData.read();
      expect(userData.state.loading).toEqual(true);
      return promise.then(() => {
        expect(userData.state.loading).toEqual(false);
      });
    });

    describe("when queried", () => {
      it("should delete the property corresponding to applied query", async () => {
        let queriedData = userData.query({ prop: "foo" });
        await queriedData.delete();
        expect(storage.stubs.setItem.getCall(0).args[1]).toEqual(JSON.stringify({}));
      });
    });
  });

  describe("Instance tags", () => {
    let fooData;

    describe("when no options are defined", () => {
      beforeEach(() => {
        fooData = new SessionStorage({ id: "fooData" });
      });

      it("should contain the browser-storage tag", () => {
        expect(providers.getByTag("browser-storage").elements[0]).toEqual(fooData);
      });

      it("should contain the session-storage tag", () => {
        expect(providers.getByTag("session-storage").elements[0]).toEqual(fooData);
      });
    });

    describe("when passing tags", () => {
      it("should contain the session-storage tag even when a custom tag is received", () => {
        fooData = new SessionStorage({ id: "fooData", tags: ["foo-tag"] });
        expect(providers.getByTag("session-storage").elements[0]).toEqual(fooData);
      });

      it("should contain the ocal-storage tag even when an array of custom tags is received", () => {
        fooData = new SessionStorage({ id: "fooData", tags: ["foo-tag", "foo-tag-2"] });
        expect(providers.getByTag("session-storage").elements[0]).toEqual(fooData);
      });

      it("should contain defined custom tag if received", () => {
        const FOO_TAG = "foo-tag";
        fooData = new SessionStorage({ id: "fooData", tags: [FOO_TAG] });
        expect(providers.getByTag(FOO_TAG).elements[0]).toEqual(fooData);
      });

      it("should contain defined custom tags if received", () => {
        expect.assertions(2);
        const FOO_TAG = "foo-tag";
        const FOO_TAG_2 = "foo-tag-2";
        fooData = new SessionStorage({ id: "fooData", tags: [FOO_TAG, FOO_TAG_2] });
        expect(providers.getByTag(FOO_TAG).elements[0]).toEqual(fooData);
        expect(providers.getByTag(FOO_TAG_2).elements[0]).toEqual(fooData);
      });
    });
  });

  describe("Instance id", () => {
    it("should be assigned based on first argument", () => {
      const FOO_ID = "foo-id";
      const fooData = new SessionStorage({ id: FOO_ID });
      expect(providers.getById(FOO_ID).elements[0]).toEqual(fooData);
    });
  });
});
