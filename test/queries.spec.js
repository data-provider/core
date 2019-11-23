/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const AxiosMock = require("./Axios.mock.js");

const { Api, apis } = require("../src/index");

describe("Api queries", () => {
  const fooQuery = {
    params: {
      foo: "foo"
    }
  };

  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
    apis.reset();
  });

  afterAll(() => {
    axios.restore();
    apis.reset();
  });

  describe("Queryed data-sources", () => {
    it("should have all crud methods", () => {
      const books = new Api("/books").query(fooQuery);
      expect(books.create).toBeDefined();
      expect(books.read).toBeDefined();
      expect(books.update).toBeDefined();
      expect(books.delete).toBeDefined();
    });
  });

  describe("Queryed sources", () => {
    it("should add query params to axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("/books").query({
        query: {
          author: "foo"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books?author=foo");
    });

    it("should add query params to axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("http://domain.com/books").query({
        query: {
          author: "foo"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "http://domain.com/books?author=foo"
      );
    });

    it("should replace params in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("/books/:id").query({
        params: {
          id: "foo"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo");
    });

    it("should replace params in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("http://localhost/books/:id").query({
        params: {
          id: "foo"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("http://localhost/books/foo");
    });

    it("should replace many params in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("/books/:id/:author").query({
        params: {
          id: "foo",
          author: "cervantes"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo/cervantes");
    });

    it("should replace many params in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("https://www.domain.com:3000/books/:id/:author").query({
        params: {
          id: "foo",
          author: "cervantes"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes"
      );
    });

    it("should replace many params and add query strings in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("/books/:id/:author").query({
        params: {
          id: "foo",
          author: "cervantes"
        },
        query: {
          page: 2,
          order: "asc"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "/books/foo/cervantes?page=2&order=asc"
      );
    });

    it("should replace many params and add query strings in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("https://www.domain.com:3000/books/:id/:author").query({
        params: {
          id: "foo",
          author: "cervantes"
        },
        query: {
          page: 2,
          order: "asc"
        }
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes?page=2&order=asc"
      );
    });
  });

  describe("Loading property of a queried method", () => {
    let books;

    beforeAll(() => {
      books = new Api("/books").query(fooQuery);
    });

    it("should be true while resource is being loaded, false when finished", () => {
      expect.assertions(2);
      const promise = books.read();
      expect(books.read.loading).toEqual(true);
      return promise.then(() => {
        expect(books.read.loading).toEqual(false);
      });
    });

    it("should not be loading when request promise is cached", async () => {
      expect.assertions(3);
      await books.read();
      expect(books.read.loading).toEqual(false);
      const secondRead = books.read();
      expect(books.read.loading).toEqual(false);
      return secondRead.then(() => {
        expect(books.read.loading).toEqual(false);
      });
    });

    it("should be loading again after cleaning cache", async () => {
      expect.assertions(3);
      await books.read();
      expect(books.read.loading).toEqual(false);
      books.clean();
      const secondRead = books.read();
      expect(books.read.loading).toEqual(true);
      return secondRead.then(() => {
        expect(books.read.loading).toEqual(false);
      });
    });

    it("should be accesible through getter", async () => {
      expect.assertions(1);
      return books.read().then(() => {
        expect(books.read.getters.loading()).toEqual(false);
      });
    });
  });

  describe("Error property of a queried method", () => {
    let books;

    beforeAll(() => {
      books = new Api("/books").query(fooQuery);
    });

    it("should be null while resource is being loaded, null when finished successfully", () => {
      expect.assertions(2);
      const promise = books.read();
      expect(books.read.error).toEqual(null);
      return promise.then(() => {
        expect(books.read.error).toEqual(null);
      });
    });

    it("should be null while resource is being loaded, error when finished with error", () => {
      const fooErrorMessage = "Foo error";
      const fooError = new Error(fooErrorMessage);
      books.clean();
      axios.stubs.instance.rejects(new Error(fooErrorMessage));

      expect.assertions(2);
      const promise = books.read();
      expect(books.read.error).toEqual(null);
      return promise.catch(() => {
        expect(books.read.error).toEqual(fooError);
      });
    });

    it("should be accesible through getter", async () => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books.clean();
      expect.assertions(1);
      return books.read().then(() => {
        expect(books.read.getters.error()).toEqual(null);
      });
    });
  });

  describe("Value property of a queried method", () => {
    let books;
    const fooData = "foo-data";

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "foo-data"
      });
      books = new Api("/books").query(fooQuery);
    });

    it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
      expect.assertions(2);
      const promise = books.read();
      expect(books.read.value).toEqual(undefined);
      return promise.then(() => {
        expect(books.read.value).toEqual(fooData);
      });
    });

    it("should be accesible through getter", async () => {
      expect.assertions(1);
      await books.read();
      expect(books.read.getters.value()).toEqual(fooData);
    });
  });

  describe("Queryed update method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books").query(fooQuery);
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.read.loading).toEqual(true);
      await promise;
      await books.update("");
      promise = books.read();
      expect(books.read.loading).toEqual(true);
      return promise.then(() => {
        expect(books.read.loading).toEqual(false);
      });
    });
  });

  describe("Queryed create method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books").query(fooQuery);
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.read.loading).toEqual(true);
      await promise;
      await books.create("");
      promise = books.read();
      expect(books.read.loading).toEqual(true);
      return promise.then(() => {
        expect(books.read.loading).toEqual(false);
      });
    });
  });

  describe("Queryed delete method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books").query(fooQuery);
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.read.loading).toEqual(true);
      await promise;
      await books.delete();
      promise = books.read();
      expect(books.read.loading).toEqual(true);
      return promise.then(() => {
        expect(books.read.loading).toEqual(false);
      });
    });
  });

  describe("Root delete method", () => {
    let books;
    let queriedBooks;

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books");
      queriedBooks = books.query(fooQuery);
    });

    it("should clean the cache of all queried resources when finish successfully", async () => {
      let cleanCalled = false;
      expect.assertions(4);
      queriedBooks.onClean(() => {
        cleanCalled = true;
      });
      let promise = queriedBooks.read();
      expect(queriedBooks.read.loading).toEqual(true);
      await promise;
      await books.delete();
      promise = queriedBooks.read();
      expect(queriedBooks.read.loading).toEqual(true);
      return promise.then(() => {
        expect(queriedBooks.read.loading).toEqual(false);
        expect(cleanCalled).toEqual(true);
      });
    });
  });

  describe("Equal queries", () => {
    let books;
    let booksQuery1;
    let booksQuery2;

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books");

      booksQuery1 = books.query(fooQuery);
      booksQuery2 = books.query(fooQuery);
    });

    it("should return the same query instance", async () => {
      expect.assertions(6);
      let promise = booksQuery1.read();
      expect(booksQuery1.read.loading).toEqual(true);
      expect(booksQuery2.read.loading).toEqual(true);
      await promise;
      await booksQuery1.update("");
      promise = booksQuery2.read();
      expect(booksQuery1.read.loading).toEqual(true);
      expect(booksQuery2.read.loading).toEqual(true);
      return promise.then(() => {
        expect(booksQuery1.read.loading).toEqual(false);
        expect(booksQuery2.read.loading).toEqual(false);
      });
    });
  });
});
