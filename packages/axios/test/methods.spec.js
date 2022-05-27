/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const AxiosMock = require("./Axios.mock.js");

const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

describe("Axios data providers", () => {
  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
  });

  afterAll(() => {
    axios.restore();
  });

  afterEach(() => {
    providers.clear();
  });

  describe("Available methods", () => {
    it("should have all crud methods available", () => {
      const books = new Axios({ id: "/books" });
      expect(books.create).toBeDefined();
      expect(books.read).toBeDefined();
      expect(books.update).toBeDefined();
      expect(books.delete).toBeDefined();
    });
  });

  describe("Loading property of a method", () => {
    let books;

    beforeAll(() => {
      books = new Axios({ id: "/books", delete: true });
    });

    it("should be true while resource is being loaded, false when finished", () => {
      expect.assertions(2);
      const promise = books.read();
      expect(books.state.loading).toEqual(true);
      return promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });

    it("should not be loading when request promise is cached", async () => {
      expect.assertions(3);
      await books.read();
      expect(books.state.loading).toEqual(false);
      const secondRead = books.read();
      expect(books.state.loading).toEqual(false);
      return secondRead.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });

    it("should be loading again after cleaning cache", async () => {
      expect.assertions(3);
      await books.read();
      expect(books.state.loading).toEqual(false);
      books.cleanCache();
      const secondRead = books.read();
      expect(books.state.loading).toEqual(true);
      return secondRead.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });
  });

  describe("Error property of a method", () => {
    let books;

    beforeAll(() => {
      books = new Axios({ id: "/books" });
    });

    it("should be null while resource is being loaded, null when finished successfully", () => {
      expect.assertions(2);
      const promise = books.read();
      expect(books.state.error).toEqual(null);
      return promise.then(() => {
        expect(books.state.error).toEqual(null);
      });
    });

    it("should be null while resource is being loaded, error when finished with error", () => {
      const fooErrorMessage = "Foo error";
      const fooError = new Error(fooErrorMessage);
      books.cleanCache();
      axios.stubs.instance.rejects(new Error(fooErrorMessage));

      expect.assertions(2);
      const promise = books.read();
      expect(books.state.error).toEqual(null);
      return promise.catch(() => {
        expect(books.state.error).toEqual(fooError);
      });
    });
  });

  describe("Data state", () => {
    let books;
    const fooData = "foo-data";

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "foo-data",
      });
      books = new Axios({ id: "/books" });
    });

    it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
      expect.assertions(2);
      const promise = books.read();
      expect(books.state.data).toEqual(undefined);
      return promise.then(() => {
        expect(books.state.data).toEqual(fooData);
      });
    });
  });

  describe("Update method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "",
      });
      books = new Axios({ id: "/books" });
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      await books.update("");
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });

    it("should clean the cache when finish successfully even when cleanCacheThrottle is configured", async () => {
      expect.assertions(3);
      books.config({
        cleanCacheThrottle: 3000,
      });
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      books.cleanCache();
      await books.read();
      await books.update("");
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });
  });

  describe("create method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "",
      });
      books = new Axios({ id: "/books" });
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      await books.create("");
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      return promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });

    it("should clean the cache when finish successfully even when cleanCacheThrottle is configured", async () => {
      expect.assertions(3);
      books.config({
        cleanCacheThrottle: 3000,
      });
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      books.cleanCache();
      await books.read();
      await books.create("");
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });
  });

  describe("delete method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "",
      });
      books = new Axios({ id: "/books" });
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      await books.delete();
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      return promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });

    it("should support delete with body", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      await books.delete({ id: "book" });
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      return promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });

    it("should clean the cache when finish successfully even when cleanCacheThrottle is configured", async () => {
      expect.assertions(3);
      books.config({
        cleanCacheThrottle: 3000,
      });
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      books.cleanCache();
      await books.read();
      await books.delete();
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });
  });
});
