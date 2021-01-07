/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const AxiosMock = require("./Axios.mock.js");

const { Selector, providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

describe("Axios data providers", () => {
  const fooBooks = [
    {
      title: "El quijote",
      author: "Cervantes",
    },
    {
      title: "El viejo y el mar",
      author: "Hemingway",
    },
  ];
  let axios;
  let books;
  let authors;

  beforeAll(() => {
    axios = new AxiosMock();
  });

  afterAll(() => {
    axios.restore();
  });

  afterEach(() => {
    providers.clear();
  });

  beforeEach(() => {
    books = new Axios({ id: "books", url: "/books" });
    authors = new Axios({ id: "authors", url: "/authors" });
    axios.stubs.instance.resolves({
      data: fooBooks,
    });
    axios.stubs.instance.resetHistory();
  });

  describe("when querying an origin", () => {
    describe("Available methods", () => {
      it("should have read method", () => {
        const selector = new Selector(books, (booksResult) => booksResult[0]);
        expect(selector.read).toBeDefined();
      });
    });

    describe("when developing tests", () => {
      describe("the selector function", () => {
        it("should be available in the test object, ready for being tested", () => {
          const selectorFunction = (booksResult) => booksResult[0];
          const selector = new Selector(books, selectorFunction);
          expect(selector.selector).toEqual(selectorFunction);
        });
      });
    });

    describe("Loading property", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(books, (booksResult) => booksResult[0]);
      });

      it("should be true while resource is being loaded, false when finished", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.loading).toEqual(true);
        return promise.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });

      it("should not be loading when request promise is cached", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.state.loading).toEqual(false);
        const secondRead = selector.read();
        expect(selector.state.loading).toEqual(false);
        return secondRead.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });

      it("should be loading again after cleaning cache", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.state.loading).toEqual(false);
        selector.cleanCache();
        const secondRead = selector.read();
        expect(selector.state.loading).toEqual(true);
        return secondRead.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });
    });

    describe("Error property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(books, (booksResult) => booksResult[0]);
      });

      it("should be null while resource is being loaded, null when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.error).toEqual(null);
        return promise.then(() => {
          expect(selector.state.error).toEqual(null);
        });
      });

      it("should be null while resource is being loaded, error when finished with error", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.cleanCache();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.error).toEqual(null);
        return promise.catch(() => {
          expect(selector.state.error).toEqual(fooError);
        });
      });

      it("should not be cached", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.cleanCache();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(5);
        const promise = selector.read();
        expect(selector.state.error).toEqual(null);
        return promise.catch(async () => {
          expect(selector.state.error).toEqual(fooError);
          axios.stubs.instance.resolves({
            data: fooBooks,
          });
          await selector.read();
          expect(selector.state.error).toEqual(null);
          expect(axios.stubs.instance.callCount).toEqual(2);
          expect(selector.state.data).toEqual(fooBooks[0]);
        });
      });
    });

    describe("Data state", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(books, (booksResult) => booksResult[0]);
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.data).toEqual(undefined);
        return promise.then(() => {
          expect(selector.state.data).toEqual(fooBooks[0]);
        });
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const defaultValue = { foo: "foo" };
        selector = new Selector(books, (booksResult) => booksResult[0], {
          initialState: { data: defaultValue },
        });
        const promise = selector.read();
        expect(selector.state.data).toEqual(defaultValue);
        return promise.then(() => {
          expect(selector.state.data).toEqual(fooBooks[0]);
        });
      });
    });

    describe("Value property of a promise method", () => {
      const selectorResult = [
        {
          title: "El quijote",
          author: "Cervantes",
          fooKey: "foo",
        },
        {
          title: "El viejo y el mar",
          author: "Hemingway",
          fooKey: "foo",
        },
      ];
      let selector;

      beforeEach(() => {
        selector = new Selector(books, (booksResults) =>
          Promise.all(
            booksResults.map((book) =>
              Promise.resolve({
                ...book,
                fooKey: "foo",
              })
            )
          )
        );
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.data).toEqual(undefined);
        return promise.then(() => {
          expect(selector.state.data).toEqual(selectorResult);
        });
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        selector = new Selector(books, (booksResult) => Promise.resolve(booksResult[0]), {
          initialState: {
            data: { foo: "foo" },
          },
        });
        const promise = selector.read();
        expect(selector.state.data).toEqual({ foo: "foo" });
        return promise.then(() => {
          expect(selector.state.data).toEqual(fooBooks[0]);
        });
      });
    });

    describe("When queried", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(
          (query) => {
            return books.query({
              queryString: {
                author: query.author,
              },
            });
          },
          (booksResult) => booksResult[0]
        );
      });

      it("should have queried providers with received query", async () => {
        expect.assertions(1);
        const queriedSelector = selector.query({ author: "cervantes" });
        await queriedSelector.read();
        expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books?author=cervantes");
      });

      it("value should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const queriedSelector = selector.query({ author: "cervantes" });
        const promise = queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        return promise.then(() => {
          expect(queriedSelector.state.data).toEqual(fooBooks[0]);
        });
      });

      it("should clean cache when one of the reproviders is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query({ author: "cervantes" });
        queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(fooBooks[0]);
        books.cleanCache();
        queriedSelector.read();
        expect(queriedSelector.state.loading).toEqual(true);
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(2);
      });
    });
  });

  describe("when querying a selector", () => {
    let booksSelector;

    beforeEach(() => {
      booksSelector = new Selector(books, (booksResult, { index = 0 }) => {
        return booksResult[index];
      });
    });

    describe("Loading property", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(booksSelector, (book) => {
          return book.title;
        });
      });

      it("should be true while resource is being loaded, false when finished", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.loading).toEqual(true);
        return promise.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });

      it("should not be loading when request promise is cached", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.state.loading).toEqual(false);
        const secondRead = selector.read();
        expect(selector.state.loading).toEqual(false);
        return secondRead.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });

      it("should be loading again after cleaning cache", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.state.loading).toEqual(false);
        selector.cleanCache();
        const secondRead = selector.read();
        expect(selector.state.loading).toEqual(true);
        return secondRead.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });
    });

    describe("Error property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(booksSelector, (book) => book.title);
      });

      it("should be null while resource is being loaded, null when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.error).toEqual(null);
        return promise.then(() => {
          expect(selector.state.error).toEqual(null);
        });
      });

      it("should be null while resource is being loaded, error when finished with error", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.cleanCache();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.error).toEqual(null);
        return promise.catch(() => {
          expect(selector.state.error).toEqual(fooError);
        });
      });
    });

    describe("Data state", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(booksSelector, (book) => book.title);
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.data).toEqual(undefined);
        return promise.then(() => {
          expect(selector.state.data).toEqual(fooBooks[0].title);
        });
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const defaultValue = { foo: "foo" };
        selector = new Selector(booksSelector, (book) => book.title, {
          initialState: {
            data: defaultValue,
          },
        });
        const promise = selector.read();
        expect(selector.state.data).toEqual(defaultValue);
        return promise.then(() => {
          expect(selector.state.data).toEqual(fooBooks[0].title);
        });
      });
    });

    describe("When queried", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(
          (query) => booksSelector.query(query),
          (bookResult) => bookResult.title
        );
      });

      it("value should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const queriedSelector = selector.query({ index: 1 });
        const promise = queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        return promise.then(() => {
          expect(queriedSelector.state.data).toEqual(fooBooks[1].title);
        });
      });

      it("should clean cache when one of the providers is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query({ index: 1 });
        queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(fooBooks[1].title);
        books.cleanCache();
        queriedSelector.read();
        expect(queriedSelector.state.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(2);
      });
    });
  });

  describe("when querying from many providers", () => {
    let booksSelector;

    beforeEach(() => {
      booksSelector = new Selector(books, (booksResult, { index = 0 }) => booksResult[index]);
    });

    describe("Loading property", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(authors, booksSelector, (authorsResults, book) => book.title);
      });

      it("should be true while resource is being loaded, false when finished", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.loading).toEqual(true);
        return promise.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });

      it("should not be loading when request promise is cached", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.state.loading).toEqual(false);
        const secondRead = selector.read();
        expect(selector.state.loading).toEqual(false);
        return secondRead.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });

      it("should be loading again after cleaning cache", async () => {
        expect.assertions(3);
        await selector.read();
        expect(selector.state.loading).toEqual(false);
        selector.cleanCache();
        const secondRead = selector.read();
        expect(selector.state.loading).toEqual(true);
        return secondRead.then(() => {
          expect(selector.state.loading).toEqual(false);
        });
      });
    });

    describe("Error property of a method", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(authors, booksSelector, (authorsResults, book) => book.title);
      });

      it("should be null while resource is being loaded, null when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.error).toEqual(null);
        return promise.then(() => {
          expect(selector.state.error).toEqual(null);
        });
      });

      it("should be null while resource is being loaded, error when finished with error", () => {
        const fooErrorMessage = "Foo error";
        const fooError = new Error(fooErrorMessage);
        books.cleanCache();
        axios.stubs.instance.rejects(new Error(fooErrorMessage));

        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.error).toEqual(null);
        return promise.catch(() => {
          expect(selector.state.error).toEqual(fooError);
        });
      });
    });

    describe("Data state", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(authors, booksSelector, (authorsResults, book) => book.title);
      });

      it("should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const promise = selector.read();
        expect(selector.state.data).toEqual(undefined);
        return promise.then(() => {
          expect(selector.state.data).toEqual(fooBooks[0].title);
        });
      });

      it("should return default value while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const defaultValue = { foo: "foo" };
        selector = new Selector(authors, booksSelector, (authorsResults, book) => book.title, {
          initialState: {
            data: defaultValue,
          },
        });
        const promise = selector.read();
        expect(selector.state.data).toEqual(defaultValue);
        return promise.then(() => {
          expect(selector.state.data).toEqual(fooBooks[0].title);
        });
      });
    });

    describe("When queried", () => {
      let selector;

      beforeEach(() => {
        selector = new Selector(
          authors,
          (query, previousResults) => {
            let finalIndex = 0;
            let hemingwayBookIndex = 0;
            previousResults[0].forEach((book) => {
              if (book.author === "Hemingway") {
                hemingwayBookIndex = finalIndex;
              }
              finalIndex++;
            });
            return booksSelector.query({ index: hemingwayBookIndex });
          },
          (authorsResults, bookResult) => bookResult.title
        );
      });

      it("should have queried providers with received query", async () => {
        expect.assertions(2);
        const queriedSelector = selector.query({ index: 1 });
        await queriedSelector.read();
        expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/authors");
        expect(axios.stubs.instance.getCall(1).args[0].url).toEqual("/books");
      });

      it("value should be undefined while resource is being loaded, and returned value when finished successfully", () => {
        expect.assertions(2);
        const queriedSelector = selector.query({ index: 1 });
        const promise = queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        return promise.then(() => {
          expect(queriedSelector.state.data).toEqual(fooBooks[1].title);
        });
      });

      it("should clean cache when one of the reproviders is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query({ index: 1 });
        queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(fooBooks[1].title);
        books.cleanCache();
        queriedSelector.read();
        expect(queriedSelector.state.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(3);
      });

      it("should clean cache when any of the providers is cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query({ index: 1 });
        queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(fooBooks[1].title);
        authors.cleanCache();
        queriedSelector.read();
        expect(queriedSelector.state.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(3);
      });

      it("should clean cache when all reproviders are cleaned", async () => {
        expect.assertions(4);
        const queriedSelector = selector.query({ index: 1 });
        queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(undefined);
        await queriedSelector.read();
        expect(queriedSelector.state.data).toEqual(fooBooks[1].title);
        authors.cleanCache();
        books.cleanCache();
        queriedSelector.read();
        expect(queriedSelector.state.loading).toEqual(true);
        await queriedSelector.read();
        await queriedSelector.read();
        await queriedSelector.read();
        expect(axios.stubs.instance.callCount).toEqual(4);
      });
    });
  });
});
