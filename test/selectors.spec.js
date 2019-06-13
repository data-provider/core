const { Selector } = require("@xbyorange/mercury");

const AxiosMock = require("./Axios.mock.js");
const { Api, apis } = require("../src/index");

describe("Api data sources", () => {
  const fooBooks = [
    {
      title: "El quijote",
      author: "Cervantes"
    },
    {
      title: "El viejo y el mar",
      author: "Hemingway"
    }
  ];
  let axios;
  let books;
  let authors;

  beforeAll(() => {
    axios = new AxiosMock();
    apis.reset();
  });

  afterAll(() => {
    axios.restore();
    apis.reset();
  });

  beforeEach(() => {
    books = new Api("/books");
    authors = new Api("/authors");
    axios.stubs.instance.resolves({
      data: fooBooks
    });
    axios.stubs.instance.resetHistory();
  });

  describe("when querying an origin", () => {
    describe("Available methods", () => {
      it("should have available all methods", () => {
        const selector = new Selector(books, booksResult => booksResult[0]);
        expect(selector.create).toBeDefined();
        expect(selector.read).toBeDefined();
        expect(selector.update).toBeDefined();
        expect(selector.delete).toBeDefined();
      });
    });

    describe("when developing tests", () => {
      describe("the selector function", () => {
        it("should be available in the test object, ready for being tested", () => {
          const selectorFunction = booksResult => booksResult[0];
          const selector = new Selector(books, selectorFunction);
          expect(selector.test.selector).toEqual(selectorFunction);
        });
      });
    });

    describe("Loading property", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(books, booksResult => booksResult[0]);
      });

      it("should be true while resource is being loaded, false when finished", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.loading).toEqual(true);
        return promise.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should not be loading when request promise is cached", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.read.loading).toEqual(false);
        const secondRead = selector.read();
        expect(selector.read.loading).toEqual(false);
        return secondRead.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should be loading again after cleaning cache", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.read.loading).toEqual(false);
        selector.clean();
        const secondRead = selector.read();
        expect(selector.read.loading).toEqual(true);
        return secondRead.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should be accesible through getter", async () => {
        expect.assertions(1);
        return selector.read().then(() => {
          expect(selector.read.getters.loading()).toEqual(false);
        });
      });
    });

    describe("Error property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(books, booksResult => booksResult[0]);
      });

      it("should be null while resource is being loaded, null when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.error).toEqual(null);
        return promise.then(() => {
          expect(selector.read.error).toEqual(null);
        });
      });

      it("should be null while resource is being loaded, error when finished with error", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.clean();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.error).toEqual(null);
        return promise.catch(() => {
          expect(selector.read.error).toEqual(fooError);
        });
      });

      it("should not be cached", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.clean();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(5);
        const promise = selector.read();
        expect(selector.read.error).toEqual(null);
        return promise.catch(async () => {
          expect(selector.read.error).toEqual(fooError);
          axios.stubs.instance.resolves({
            data: fooBooks
          });
          await selector.read();
          expect(selector.read.error).toEqual(null);
          expect(axios.stubs.instance.callCount).toEqual(2);
          expect(selector.read.value).toEqual(fooBooks[0]);
        });
      });

      it("should be accesible through getter", async () => {
        books.clean();
        expect.assertions(1);
        return selector.read().then(() => {
          expect(selector.read.getters.error()).toEqual(null);
        });
      });
    });

    describe("Value property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(books, booksResult => booksResult[0]);
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.value).toEqual(undefined);
        return promise.then(() => {
          expect(selector.read.value).toEqual(fooBooks[0]);
        });
      });

      it("should be accesible through getter", async () => {
        expect.assertions(1);
        await selector.read();
        expect(selector.read.getters.value()).toEqual(fooBooks[0]);
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const defaultValue = { foo: "foo" };
        selector = new Selector(books, booksResult => booksResult[0], defaultValue);
        const promise = selector.read();
        expect(selector.read.value).toEqual(defaultValue);
        return promise.then(() => {
          expect(selector.read.value).toEqual(fooBooks[0]);
        });
      });
    });

    describe("Value property of a promise method", () => {
      const selectorResult = [
        {
          title: "El quijote",
          author: "Cervantes",
          fooKey: "foo"
        },
        {
          title: "El viejo y el mar",
          author: "Hemingway",
          fooKey: "foo"
        }
      ];
      let selector;

      beforeEach(() => {
        selector = new Selector(books, booksResults =>
          Promise.all(
            booksResults.map(book =>
              Promise.resolve({
                ...book,
                fooKey: "foo"
              })
            )
          )
        );
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.value).toEqual(undefined);
        return promise.then(() => {
          expect(selector.read.value).toEqual(selectorResult);
        });
      });

      it("should be accesible through getter", async () => {
        expect.assertions(1);
        await selector.read();
        expect(selector.read.getters.value()).toEqual(selectorResult);
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const defaultValue = { foo: "foo" };
        selector = new Selector(
          books,
          booksResult => Promise.resolve(booksResult[0]),
          defaultValue
        );
        const promise = selector.read();
        expect(selector.read.value).toEqual(defaultValue);
        return promise.then(() => {
          expect(selector.read.value).toEqual(fooBooks[0]);
        });
      });
    });

    describe("When queried", () => {
      let query;
      let selector;

      beforeEach(() => {
        query = queryValue => ({
          query: {
            author: queryValue
          }
        });
        selector = new Selector(
          {
            source: books,
            query
          },
          booksResult => booksResult[0]
        );
      });

      it("should have queried sources with received query", async () => {
        expect.assertions(1);
        const queriedSelector = selector.query("cervantes");
        await queriedSelector.read();
        expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books?author=cervantes");
      });

      it("value should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const queriedSelector = selector.query("cervantes");
        const promise = queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        return promise.then(() => {
          expect(queriedSelector.read.value).toEqual(fooBooks[0]);
        });
      });

      it("should clean cache when one of the resources is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query("cervantes");
        queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(fooBooks[0]);
        books.clean();
        queriedSelector.read();
        expect(queriedSelector.read.loading).toEqual(true);
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(2);
      });

      describe("when developing tests", () => {
        describe("the query function", () => {
          it("should be available in the test object, ready for being tested", () => {
            expect(selector.test.queries[0]).toEqual(query);
          });
        });
      });
    });
  });

  describe("when querying a selector", () => {
    let booksSelector;

    beforeEach(() => {
      booksSelector = new Selector(books, (booksResult, index = 0) => booksResult[index]);
    });

    describe("Loading property", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(booksSelector, book => book.title);
      });

      it("should be true while resource is being loaded, false when finished", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.loading).toEqual(true);
        return promise.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should not be loading when request promise is cached", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.read.loading).toEqual(false);
        const secondRead = selector.read();
        expect(selector.read.loading).toEqual(false);
        return secondRead.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should be loading again after cleaning cache", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.read.loading).toEqual(false);
        selector.clean();
        const secondRead = selector.read();
        expect(selector.read.loading).toEqual(true);
        return secondRead.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should be accesible through getter", async () => {
        expect.assertions(1);
        return selector.read().then(() => {
          expect(selector.read.getters.loading()).toEqual(false);
        });
      });
    });

    describe("Error property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(booksSelector, book => book.title);
      });

      it("should be null while resource is being loaded, null when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.error).toEqual(null);
        return promise.then(() => {
          expect(selector.read.error).toEqual(null);
        });
      });

      it("should be null while resource is being loaded, error when finished with error", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.clean();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.error).toEqual(null);
        return promise.catch(() => {
          expect(selector.read.error).toEqual(fooError);
        });
      });

      it("should be accesible through getter", async () => {
        books.clean();
        expect.assertions(1);
        return selector.read().then(() => {
          expect(selector.read.getters.error()).toEqual(null);
        });
      });
    });

    describe("Value property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(booksSelector, book => book.title);
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.value).toEqual(undefined);
        return promise.then(() => {
          expect(selector.read.value).toEqual(fooBooks[0].title);
        });
      });

      it("should be accesible through getter", async () => {
        expect.assertions(1);
        await selector.read();
        expect(selector.read.getters.value()).toEqual(fooBooks[0].title);
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const defaultValue = { foo: "foo" };
        selector = new Selector(booksSelector, book => book.title, defaultValue);
        const promise = selector.read();
        expect(selector.read.value).toEqual(defaultValue);
        return promise.then(() => {
          expect(selector.read.value).toEqual(fooBooks[0].title);
        });
      });
    });

    describe("When queried", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(
          {
            source: booksSelector,
            query: queryValue => queryValue
          },
          bookResult => bookResult.title
        );
      });

      it("should have queried sources with received query", async () => {
        expect.assertions(1);
        const queriedSelector = selector.query(1);
        await queriedSelector.read();
        expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books");
      });

      it("value should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const queriedSelector = selector.query(1);
        const promise = queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        return promise.then(() => {
          expect(queriedSelector.read.value).toEqual(fooBooks[1].title);
        });
      });

      it("should clean cache when one of the resources is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query(1);
        queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(fooBooks[1].title);
        books.clean();
        queriedSelector.read();
        expect(queriedSelector.read.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(2);
      });
    });
  });

  describe("when querying from many sources", () => {
    let booksSelector;

    beforeEach(() => {
      booksSelector = new Selector(books, (booksResult, index = 0) => booksResult[index]);
    });

    describe("Loading property", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(authors, booksSelector, (authors, book) => book.title);
      });

      it("should be true while resource is being loaded, false when finished", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.loading).toEqual(true);
        return promise.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should not be loading when request promise is cached", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.read.loading).toEqual(false);
        const secondRead = selector.read();
        expect(selector.read.loading).toEqual(false);
        return secondRead.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should be loading again after cleaning cache", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.read.loading).toEqual(false);
        selector.clean();
        const secondRead = selector.read();
        expect(selector.read.loading).toEqual(true);
        return secondRead.then(() => {
          expect(selector.read.loading).toEqual(false);
        });
      });

      it("should be accesible through getter", async () => {
        expect.assertions(1);
        return selector.read().then(() => {
          expect(selector.read.getters.loading()).toEqual(false);
        });
      });
    });

    describe("Error property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(authors, booksSelector, (authors, book) => book.title);
      });

      it("should be null while resource is being loaded, null when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.error).toEqual(null);
        return promise.then(() => {
          expect(selector.read.error).toEqual(null);
        });
      });

      it("should be null while resource is being loaded, error when finished with error", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.clean();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.error).toEqual(null);
        return promise.catch(() => {
          expect(selector.read.error).toEqual(fooError);
        });
      });

      it("should be accesible through getter", async () => {
        books.clean();
        expect.assertions(1);
        return selector.read().then(() => {
          expect(selector.read.getters.error()).toEqual(null);
        });
      });
    });

    describe("Value property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(authors, booksSelector, (authors, book) => book.title);
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.read.value).toEqual(undefined);
        return promise.then(() => {
          expect(selector.read.value).toEqual(fooBooks[0].title);
        });
      });

      it("should be accesible through getter", async () => {
        expect.assertions(1);
        await selector.read();
        expect(selector.read.getters.value()).toEqual(fooBooks[0].title);
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const defaultValue = { foo: "foo" };
        selector = new Selector(
          authors,
          booksSelector,
          (authors, book) => book.title,
          defaultValue
        );
        const promise = selector.read();
        expect(selector.read.value).toEqual(defaultValue);
        return promise.then(() => {
          expect(selector.read.value).toEqual(fooBooks[0].title);
        });
      });
    });

    describe("When queried", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(
          authors,
          {
            source: booksSelector,
            query: (queryValue, previousResults) => {
              let index = 0;
              let hemingwayBookIndex = 0;
              previousResults[0].forEach(book => {
                if (book.author === "Hemingway") {
                  hemingwayBookIndex = index;
                }
                index++;
              });
              return hemingwayBookIndex;
            }
          },
          (authors, bookResult) => bookResult.title
        );
      });

      it("should have queried sources with received query", async () => {
        expect.assertions(2);
        const queriedSelector = selector.query(1);
        await queriedSelector.read();
        expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/authors");
        expect(axios.stubs.instance.getCall(1).args[0].url).toEqual("/books");
      });

      it("value should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const queriedSelector = selector.query(1);
        const promise = queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        return promise.then(() => {
          expect(queriedSelector.read.value).toEqual(fooBooks[1].title);
        });
      });

      it("should clean cache when one of the resources is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query(1);
        queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(fooBooks[1].title);
        books.clean();
        queriedSelector.read();
        expect(queriedSelector.read.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(3);
      });

      it("should clean cache when any of the resources is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query(1);
        queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(fooBooks[1].title);
        authors.clean();
        queriedSelector.read();
        expect(queriedSelector.read.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(3);
      });

      it("should clean cache when all resources are cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query(1);
        queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.read.value).toEqual(fooBooks[1].title);
        authors.clean();
        books.clean();
        queriedSelector.read();
        expect(queriedSelector.read.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(4);
      });
    });
  });
});
