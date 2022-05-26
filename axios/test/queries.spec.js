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
  const fooQuery = {
    urlParams: {
      foo: "foo",
    },
  };

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

  describe("Queryed data-providers", () => {
    it("should have all crud methods", () => {
      const books = new Axios({ id: "/books", url: "/books" }).query(fooQuery);
      expect(books.create).toBeDefined();
      expect(books.read).toBeDefined();
      expect(books.update).toBeDefined();
      expect(books.delete).toBeDefined();
    });
  });

  describe("Queried providers", () => {
    it("should add query params to axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "/books",
      }).query({
        queryString: {
          author: "foo",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books?author=foo");
    });

    it("should add query params to axios request as duplicated keys", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "/books",
      }).query({
        queryString: {
          authors: ["foo", "foo2", "foo3"],
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "/books?authors=foo&authors=foo2&authors=foo3"
      );
    });

    it("should add query params to axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "http://domain.com/books",
      }).query({
        queryString: {
          author: "foo",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "http://domain.com/books?author=foo"
      );
    });

    it("should replace params in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "/books/:id" }).query({
        urlParams: {
          id: "foo",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo");
    });

    it("should replace params encoding them correctly", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "/books/:id" }).query({
        urlParams: {
          id: "café",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/caf%C3%A9");
    });

    it("should replace params in axios request maintaining trailing slash", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "/books/:id/" }).query({
        urlParams: {
          id: "foo",
        },
      });

      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo/");
    });

    it("should replace params in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "http://127.0.0.1/books/:id" }).query({
        urlParams: {
          id: "foo",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("http://127.0.0.1/books/foo");
    });

    it("should replace many params in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "/books/:id/:author" }).query({
        urlParams: {
          id: "foo",
          author: "cervantes",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo/cervantes");
    });

    it("should replace many params in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "https://www.domain.com:3000/books/:id/:author",
      }).query({
        urlParams: {
          id: "foo",
          author: "cervantes",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes"
      );
    });

    it("should replace many params and add query strings in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({ url: "/books/:id/:author" }).query({
        urlParams: {
          id: "foo",
          author: "cervantes",
        },
        queryString: {
          page: 2,
          order: "asc",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "/books/foo/cervantes?order=asc&page=2"
      );
    });

    it("should replace many params and add query strings in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "https://www.domain.com:3000/books/:id/:author",
      }).query({
        urlParams: {
          id: "foo",
          author: "cervantes",
        },
        queryString: {
          page: 2,
          order: "asc",
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes?order=asc&page=2"
      );
    });
  });

  describe("queryStringConfig option", () => {
    it('when arrayFormat option is "comma", it should add query params to axios request as comma separated list', async () => {
      axios.stubs.instance.resetHistory();
      const books = new Axios({
        url: "/books",
        queryStringConfig: {
          arrayFormat: "comma",
        },
      }).query({
        queryString: {
          authors: ["foo", "foo2", "foo3"],
        },
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books?authors=foo,foo2,foo3");
    });
  });

  describe("Loading property of a queried method", () => {
    let books;

    beforeAll(() => {
      books = new Axios({ url: "/books" }).query(fooQuery);
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

  describe("Error property of a queried method", () => {
    let books;

    beforeAll(() => {
      books = new Axios({ url: "/books" }).query(fooQuery);
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

  describe("Value property of a queried method", () => {
    let books;
    const fooData = "foo-data";

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "foo-data",
      });
      books = new Axios({ url: "/books" }).query(fooQuery);
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

  describe("Queried update method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "",
      });
      books = new Axios({ url: "/books" }).query(fooQuery);
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
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "",
      });
      books = new Axios({ url: "/books" }).query(fooQuery);
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
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "",
      });
      books = new Axios({ url: "/books" }).query(fooQuery);
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
    let books;
    let queriedBooks;

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "",
      });
      books = new Axios({ url: "/books" });
      queriedBooks = books.query(fooQuery);
    });

    it("should clean the cache of all queried providers when finish successfully", async () => {
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
      books = new Axios({ url: "/books" });

      booksQuery1 = books.query(fooQuery);
      booksQuery2 = books.query(fooQuery);
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
