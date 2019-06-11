const AxiosMock = require("./Axios.mock.js");

const { Api, apis } = require("../src/index");

describe("Api data sources", () => {
  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
    apis.reset();
  });

  afterAll(() => {
    axios.restore();
    apis.reset();
  });

  describe("Available methods", () => {
    it("should have all crud methods available", () => {
      const books = new Api("/books");
      expect(books.create).toBeDefined();
      expect(books.read).toBeDefined();
      expect(books.update).toBeDefined();
      expect(books.delete).toBeDefined();
    });
  });

  describe("Loading property of a method", () => {
    let books;

    beforeAll(() => {
      books = new Api("/books", {
        delete: true
      });
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

  describe("Error property of a method", () => {
    let books;

    beforeAll(() => {
      books = new Api("/books");
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

  describe("Value property of a method", () => {
    let books;
    const fooData = "foo-data";

    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: "foo-data"
      });
      books = new Api("/books");
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

  describe("Update method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books");
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

  describe("create method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books");
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

  describe("delete method", () => {
    let books;
    beforeEach(() => {
      axios.stubs.instance.resolves({
        data: ""
      });
      books = new Api("/books");
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
});
