const AxiosMock = require("./Axios.mock.js");

const { Api } = require("../src/index");

describe("Api events", () => {
  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
  });

  afterAll(() => {
    axios.restore();
  });

  describe("when cleaning cache of root resource", () => {
    it("should execute clean listeners", () => {
      let called = false;
      expect.assertions(1);
      const books = new Api("/books");
      books.onClean(() => {
        called = true;
      });

      books.clean();
      expect(called).toEqual(true);
    });

    it("should execute onceClean listeners only once", () => {
      let callCounter = 0;
      expect.assertions(1);
      const books = new Api("/books");
      books.onceClean(() => {
        callCounter++;
      });

      books.clean();
      books.clean();
      expect(callCounter).toEqual(1);
    });

    it("should not execute clean listeners if were removed", () => {
      let called = false;
      expect.assertions(1);
      const books = new Api("/books");
      const setCalled = () => {
        called = true;
      };
      books.onClean(setCalled);
      books.removeCleanListener(setCalled);

      books.clean();
      expect(called).toEqual(false);
    });

    it("should execute clean listeners of queried resources", () => {
      let called = false;
      let queriedCalled = false;
      expect.assertions(2);
      const books = new Api("/books");
      const queriedBooks = books.query("foo");
      books.onClean(() => {
        called = true;
      });
      queriedBooks.onClean(() => {
        queriedCalled = true;
      });

      books.clean();
      expect(called).toEqual(true);
      expect(queriedCalled).toEqual(true);
    });
  });

  describe("when cleaning cache of a queried source", () => {
    it("should execute clean listeners, and cleanAny listeners", () => {
      let called = false;
      let anyCalled = false;
      expect.assertions(2);
      const books = new Api("/books");
      const queriedBooks = books.query("foo");

      books.onCleanAny(() => {
        anyCalled = true;
      });

      queriedBooks.onClean(() => {
        called = true;
      });

      queriedBooks.clean();
      expect(called).toEqual(true);
      expect(anyCalled).toEqual(true);
    });

    it("should not execute clean listeners nor cleanAny listeners if were removed", () => {
      let called = false;
      let anyCalled = false;
      expect.assertions(2);
      const books = new Api("/books");
      const queriedBooks = books.query("foo");

      const setCalled = () => {
        called = true;
      };

      const setAnyCalled = () => {
        anyCalled = true;
      };

      books.onCleanAny(setAnyCalled);
      books.removeCleanAnyListener(setAnyCalled);

      queriedBooks.onClean(setCalled);
      queriedBooks.removeCleanListener(setCalled);

      queriedBooks.clean();
      expect(called).toEqual(false);
      expect(anyCalled).toEqual(false);
    });
  });

  describe("when any property change", () => {
    it("should execute change listeners", async () => {
      let called = false;
      expect.assertions(1);
      const books = new Api("/books");
      books.onChange(() => {
        called = true;
      });

      await books.read();
      expect(called).toEqual(true);
    });

    it("should not execute change listeners if were removed", async () => {
      let called = false;
      expect.assertions(1);
      const books = new Api("/books");
      const setCalled = () => {
        called = true;
      };
      books.onChange(setCalled);
      books.removeChangeListener(setCalled);

      await books.read();
      expect(called).toEqual(false);
    });
  });

  describe("when any property of a queried source change", () => {
    it("should execute change listeners, and changeAny listeners", async () => {
      expect.assertions(2);
      let called = false;
      let calledAny = false;

      const books = new Api("/books");
      const queriedBooks = books.query("foo");

      books.onChangeAny(() => {
        calledAny = true;
      });

      queriedBooks.onChange(() => {
        called = true;
      });

      await queriedBooks.read();
      expect(called).toEqual(true);
      expect(calledAny).toEqual(true);
    });

    it("should not execute change listeners nor changeAny listeners if were removed", async () => {
      expect.assertions(2);
      let called = false;
      let calledAny = false;

      const books = new Api("/books");
      const queriedBooks = books.query("foo");

      const setCalled = () => {
        called = true;
      };

      const setAnyCalled = () => {
        calledAny = true;
      };

      books.onChangeAny(setAnyCalled);
      books.removeChangeAnyListener(setAnyCalled);

      queriedBooks.onChange(setCalled);
      queriedBooks.removeChangeListener(setCalled);

      await queriedBooks.read();
      expect(called).toEqual(false);
      expect(calledAny).toEqual(false);
    });
  });
});
