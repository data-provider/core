/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const { Memory } = require("../src/index");

describe("Memory origin", () => {
  afterEach(() => {
    providers.clear();
  });

  describe("Available methods", () => {
    it("should have all CRUD methods", () => {
      const userData = new Memory();
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

  describe("Value property of a method", () => {
    let userData;
    const fooData = {
      foo: "foo-value",
    };

    beforeEach(() => {
      userData = new Memory("foo-id", {
        initialState: {
          data: fooData,
        },
      });
    });

    describe("without initialState", () => {
      it("should return an empty object while resource is being loaded", () => {
        userData = new Memory("foo-id-2");
        expect.assertions(2);
        const promise = userData.read();
        expect(userData.state.data).toEqual({});
        return promise.then(() => {
          expect(userData.state.data).toEqual({});
        });
      });
    });

    describe("without query", () => {
      it("should return default value while resource is being loaded", () => {
        expect.assertions(2);
        const promise = userData.read();
        expect(userData.state.data).toEqual(fooData);
        return promise.then(() => {
          expect(userData.state.data).toEqual(fooData);
        });
      });
    });

    describe("when queried", () => {
      it("should return default value correspondent to query while resource is being loaded", () => {
        expect.assertions(2);
        userData = new Memory("foo-id-2", {
          initialState: {
            data: fooData,
          },
        });
        let queriedData = userData.query({ prop: "foo" });
        const promise = queriedData.read();
        expect(queriedData.state.data).toEqual(fooData.foo);
        return promise.then((value) => {
          expect(value).toEqual(fooData.foo);
        });
      });

      it("should return the property corresponding to applied query", async () => {
        let queriedData = userData.query({ prop: "foo" });
        const result = await queriedData.read();
        expect(result).toEqual("foo-value");
      });
    });
  });

  describe("Update method", () => {
    let userData;
    let fooData;

    beforeEach(() => {
      fooData = {
        foo: "foo-value",
      };

      userData = new Memory("foo-id", {
        initialState: {
          data: fooData,
        },
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
        const value = await userData.read();
        expect(value).toEqual(newValue);
      });
    });

    describe("when queried", () => {
      it("should set the property corresponding to applied query in parent", async () => {
        let queriedData = userData.query({ prop: "foo" });
        await queriedData.update("foo-updated-value");
        const value = await userData.read();
        expect(value).toEqual({
          foo: "foo-updated-value",
        });
      });

      it("should set the property corresponding to applied query", async () => {
        let queriedData = userData.query({ prop: "foo" });
        await queriedData.update("foo-updated-value");
        const value = await queriedData.read();
        expect(value).toEqual("foo-updated-value");
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

    describe("when property did not exist", () => {
      it("should add the new prop in parent", async () => {
        await userData.query({ prop: "foo2" }).update("foo-new");
        const value = await userData.read();
        expect(value).toEqual({
          foo: "foo-value",
          foo2: "foo-new",
        });
      });

      it("should add the new prop", async () => {
        await userData.query({ prop: "foo2" }).update("foo-new");
        const value = await userData.query({ prop: "foo2" }).read();
        expect(value).toEqual("foo-new");
      });
    });
  });

  describe("Delete method", () => {
    let userData;
    const fooData = {
      foo: "foo-value",
      foo2: "foo-value-2",
    };

    beforeEach(() => {
      userData = new Memory("foo-id-2", {
        initialState: {
          data: fooData,
        },
      });
    });

    it("should delete the property corresponding to applied query in parent", async () => {
      let queriedData = userData.query({ prop: "foo" });
      await queriedData.delete();
      await userData.read();
      expect(userData.state.data).toEqual({
        foo2: "foo-value-2",
      });
    });

    it("should delete the property corresponding to applied query", async () => {
      let queriedData = userData.query({ prop: "foo" });
      await queriedData.delete();
      await queriedData.read();
      expect(queriedData.state.data).toEqual(undefined);
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
  });

  describe("Instance id", () => {
    it("should be assigned based on first argument", () => {
      const FOO_ID = "foo-id";
      const fooData = new Memory(FOO_ID);
      expect(providers.getById(FOO_ID).elements[0]).toEqual(fooData);
    });
  });

  describe("Instance tags", () => {
    describe("when no options are defined", () => {
      it("should contain the memory tag", () => {
        const fooData = new Memory("foo");
        expect(providers.getByTag("memory").elements[0]).toEqual(fooData);
      });
    });

    describe("when passing options as second argument", () => {
      it("should contain the memory tag even when a custom tag is received", () => {
        const fooData = new Memory("foo", {
          tags: ["foo-tag"],
        });
        expect(providers.getByTag("memory").elements[0]).toEqual(fooData);
      });

      it("should contain the memory tag even when an array of custom tags is received", () => {
        const fooData = new Memory("foo", {
          tags: ["foo-tag", "foo-tag-2"],
        });
        expect(providers.getByTag("memory").elements[0]).toEqual(fooData);
      });

      it("should contain defined custom tag if received", () => {
        const FOO_TAG = "foo-tag";
        const fooData = new Memory("foo", {
          tags: [FOO_TAG],
        });
        expect(providers.getByTag(FOO_TAG).elements[0]).toEqual(fooData);
      });

      it("should contain defined custom tags if received", () => {
        expect.assertions(2);
        const FOO_TAG = "foo-tag";
        const FOO_TAG_2 = "foo-tag-2";
        const fooData = new Memory("foo", {
          tags: [FOO_TAG, FOO_TAG_2],
        });
        expect(providers.getByTag(FOO_TAG).elements[0]).toEqual(fooData);
        expect(providers.getByTag(FOO_TAG_2).elements[0]).toEqual(fooData);
      });
    });
  });
});
