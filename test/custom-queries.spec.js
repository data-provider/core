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

describe("Axios queries", () => {
  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
  });

  beforeEach(() => {
    providers.clear();
  });

  afterAll(() => {
    axios.restore();
    providers.clear();
  });

  describe("Custom queried providers", () => {
    const byAuthor = (author) => ({
      queryString: {
        author,
      },
    });

    const byAuthorParam = (author) => ({
      urlParams: {
        author,
      },
    });

    const byId = (id) => ({
      urlParams: {
        id,
      },
    });

    describe("when developing tests", () => {
      describe("the custom query function", () => {
        it("should be available in the queryMethods object, ready for being tested", () => {
          const books = new Axios({ id: "books" });
          books.addQuery("byAuthor", byAuthor);
          expect(books.queryMethods.byAuthor).toEqual(byAuthor);
        });
      });
    });

    it("should add query params to axios request", async () => {
      const books = new Axios({ id: "/books", url: "/books" });
      books.addQuery("byAuthor", byAuthor);

      const queriedBooks = books.queries.byAuthor("foo");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books?author=foo");
    });

    it("should add query params to axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "http://domain.com/books",
      });
      books.addQuery("byAuthor", byAuthor);
      const queriedBooks = books.queries.byAuthor("foo");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "http://domain.com/books?author=foo"
      );
    });

    it("should replace params in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "/books/:id",
      });
      books.addQuery("byId", byId);

      const queriedBooks = books.queries.byId("foo");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo");
    });

    it("should replace params in axios request maintaining trailing slash", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "/books/:id/",
      });
      books.addQuery("byId", byId);

      const queriedBooks = books.queries.byId("foo");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo/");
    });

    it("should replace params in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "http://127.0.0.1/books/:id",
      });
      books.addQuery("byId", byId);

      const queriedBooks = books.queries.byId("foo");

      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("http://127.0.0.1/books/foo");
    });

    it("should replace many params in axios request when chaining custom queries", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "/books/:id/:author",
      });
      books.addQuery("byId", byId);
      books.addQuery("byAuthorParam", byAuthorParam);
      const queriedBooks = books.queries.byId("foo").queries.byAuthorParam("cervantes");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo/cervantes");
    });

    it("should replace many params in axios request when url includes protocol and custom queries are being chained", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "https://www.domain.com:3000/books/:id/:author",
      });
      books.addQuery("byId", byId);
      books.addQuery("byAuthorParam", byAuthorParam);
      const queriedBooks = books.queries.byId("foo").queries.byAuthorParam("cervantes");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes"
      );
    });

    it("should replace many params and add query strings in axios request chaining custom queries and standard queries", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "/books/:id/:author" });
      books.addQuery("byId", byId);
      books.addQuery("byAuthorParam", byAuthorParam);
      const queriedBooks = books.queries
        .byId("foo")
        .queries.byAuthorParam("cervantes")
        .query({
          queryString: {
            page: 2,
          },
        })
        .query({
          queryString: {
            order: "asc",
          },
        });
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "/books/foo/cervantes?order=asc&page=2"
      );
    });

    it("should replace many params and add query strings in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "https://www.domain.com:3000/books/:id/:author" });
      books.addQuery("byId", byId);
      books.addQuery("byAuthorParam", byAuthorParam);
      const queriedBooks = books.queries
        .byId("foo")
        .queries.byAuthorParam("cervantes")
        .query({
          queryString: {
            page: 2,
          },
        })
        .query({
          queryString: {
            order: "asc",
          },
        });
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes?order=asc&page=2"
      );
    });
  });

  describe("Loading property of a custom queried method", () => {
    let booksSource;
    let books;

    beforeAll(() => {
      booksSource = new Axios({ url: "/books" });
      booksSource.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      books = booksSource.queries.byFoo("foo");
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

  describe("Error property of a custom queried method", () => {
    let booksSource;
    let books;

    beforeAll(() => {
      booksSource = new Axios({ id: "/books" });
      booksSource.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      books = booksSource.queries.byFoo("foo");
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

  describe("data property of a queried method", () => {
    let booksSource;
    let books;
    const fooData = "foo-data";

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "foo-data",
      });
      booksSource = new Axios({ id: "/books" });
      booksSource.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      books = booksSource.queries.byFoo("foo");
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

  describe("Queryed update method", () => {
    let booksSource;
    let books;

    beforeEach(() => {
      booksSource = new Axios({ id: "/books" });
      booksSource.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      books = booksSource.queries.byFoo("foo");
    });

    it("should clean the cache when finish successfully", async () => {
      expect.assertions(3);
      let promise = books.read();
      expect(books.state.loading).toEqual(true);
      await promise;
      await books.update("");
      promise = books.read();
      expect(books.state.loading).toEqual(true);
      return promise.then(() => {
        expect(books.state.loading).toEqual(false);
      });
    });
  });

  describe("Queryed create method", () => {
    let booksSource;
    let books;

    beforeEach(() => {
      booksSource = new Axios({ id: "/books" });
      booksSource.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      books = booksSource.queries.byFoo("foo");
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
  });

  describe("Queryed delete method", () => {
    let booksSource;
    let books;

    beforeEach(() => {
      booksSource = new Axios({ id: "/books" });
      booksSource.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      books = booksSource.queries.byFoo("foo");
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
  });

  describe("Root delete method", () => {
    let queriedBooks;
    let books;

    beforeEach(() => {
      books = new Axios({ id: "/books" });
      books.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      queriedBooks = books.queries.byFoo("foo");
    });

    it("should clean the cache of all queried reproviders when finish successfully", async () => {
      let cleanCalled = false;
      expect.assertions(4);
      queriedBooks.on("cleanCache", () => {
        cleanCalled = true;
      });
      let promise = queriedBooks.read();
      expect(queriedBooks.state.loading).toEqual(true);
      await promise;
      await books.delete();
      promise = queriedBooks.read();
      expect(queriedBooks.state.loading).toEqual(true);
      return promise.then(() => {
        expect(queriedBooks.state.loading).toEqual(false);
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
        data: "",
      });
      books = new Axios({ id: "/books" });
      books.addQuery("byFoo", (foo) => ({
        urlParams: {
          foo,
        },
      }));

      booksQuery1 = books.queries.byFoo("foo");
      booksQuery2 = books.queries.byFoo("foo");
    });

    it("should return the same query instance", async () => {
      expect.assertions(6);
      let promise = booksQuery1.read();
      expect(booksQuery1.state.loading).toEqual(true);
      expect(booksQuery2.state.loading).toEqual(true);
      await promise;
      await booksQuery1.update("");
      promise = booksQuery2.read();
      expect(booksQuery1.state.loading).toEqual(true);
      expect(booksQuery2.state.loading).toEqual(true);
      return promise.then(() => {
        expect(booksQuery1.state.loading).toEqual(false);
        expect(booksQuery2.state.loading).toEqual(false);
      });
    });
  });
});
