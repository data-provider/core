const AxiosMock = require("./Axios.mock.js");

const { Api } = require("../src/index");

describe("Api queries", () => {
  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
  });

  afterAll(() => {
    axios.restore();
  });

  describe("Custom queried sources", () => {
    const byAuthor = author => ({
      queryString: {
        author
      }
    });

    const byAuthorParam = author => ({
      urlParams: {
        author
      }
    });

    const byId = id => ({
      urlParams: {
        id
      }
    });

    describe("when developing tests", () => {
      describe("the custom query function", () => {
        it("should be available in the test object, ready for being tested", () => {
          const books = new Api("/books");
          books.addCustomQuery({
            byAuthor
          });
          expect(books.test.customQueries.byAuthor).toEqual(byAuthor);
        });
      });
    });

    it("should add query params to axios request", async () => {
      const books = new Api("/books");
      books.addCustomQuery({
        byAuthor
      });

      const queriedBooks = books.byAuthor("foo");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books?author=foo");
    });

    it("should add query params to axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("http://domain.com/books");
      books.addCustomQuery({
        byAuthor
      });
      const queriedBooks = books.byAuthor("foo");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "http://domain.com/books?author=foo"
      );
    });

    it("should replace params in axios request", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("/books/:id");
      books.addCustomQuery({
        byId
      });

      const queriedBooks = books.byId("foo");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo");
    });

    it("should replace params in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("http://localhost/books/:id");
      books.addCustomQuery({
        byId
      });

      const queriedBooks = books.byId("foo");

      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("http://localhost/books/foo");
    });

    it("should replace many params in axios request when chaining custom queries", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("/books/:id/:author");
      books.addCustomQueries({
        byId,
        byAuthorParam
      });
      const queriedBooks = books.byId("foo").byAuthorParam("cervantes");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books/foo/cervantes");
    });

    it("should replace many params in axios request when url includes protocol and custom queries are being chained", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("https://www.domain.com:3000/books/:id/:author");
      books.addCustomQueries({
        byId,
        byAuthorParam
      });
      const queriedBooks = books.byId("foo").byAuthorParam("cervantes");
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes"
      );
    });

    it("should replace many params and add query strings in axios request chaining custom queries and standard queries", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("/books/:id/:author");
      books.addCustomQueries({
        byId,
        byAuthorParam
      });
      const queriedBooks = books
        .byId("foo")
        .byAuthorParam("cervantes")
        .query({
          queryString: {
            page: 2
          }
        })
        .query({
          queryString: {
            order: "asc"
          }
        });
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "/books/foo/cervantes?page=2&order=asc"
      );
    });

    it("should replace many params and add query strings in axios request when url includes protocol", async () => {
      axios.stubs.instance.resetHistory();
      const books = new Api("https://www.domain.com:3000/books/:id/:author");
      books.addCustomQueries({
        byId,
        byAuthorParam
      });
      const queriedBooks = books
        .byId("foo")
        .byAuthorParam("cervantes")
        .query({
          queryString: {
            page: 2
          }
        })
        .query({
          queryString: {
            order: "asc"
          }
        });
      await queriedBooks.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual(
        "https://www.domain.com:3000/books/foo/cervantes?page=2&order=asc"
      );
    });
  });

  describe("Loading property of a custom queried method", () => {
    let booksSource;
    let books;

    beforeAll(() => {
      booksSource = new Api("/books");
      booksSource.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      books = booksSource.byFoo("foo");
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

  describe("Error property of a custom queried method", () => {
    let booksSource;
    let books;

    beforeAll(() => {
      booksSource = new Api("/books");
      booksSource.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      books = booksSource.byFoo("foo");
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
    let booksSource;
    let books;
    const fooData = "foo-data";

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "foo-data"
      });
      booksSource = new Api("/books");
      booksSource.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      books = booksSource.byFoo("foo");
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
    let booksSource;
    let books;

    beforeEach(() => {
      booksSource = new Api("/books");
      booksSource.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      books = booksSource.byFoo("foo");
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
    let booksSource;
    let books;

    beforeEach(() => {
      booksSource = new Api("/books");
      booksSource.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      books = booksSource.byFoo("foo");
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
    let booksSource;
    let books;

    beforeEach(() => {
      booksSource = new Api("/books");
      booksSource.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      books = booksSource.byFoo("foo");
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
    let queriedBooks;
    let books;

    beforeEach(() => {
      books = new Api("/books");
      books.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      queriedBooks = books.byFoo("foo");
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
      books.addCustomQuery({
        byFoo: foo => ({
          urlParams: {
            foo
          }
        })
      });

      booksQuery1 = books.byFoo("foo");
      booksQuery2 = books.byFoo("foo");
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
