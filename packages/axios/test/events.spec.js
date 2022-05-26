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
const { wait } = require("./helpers");

describe("Axios events", () => {
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

  describe("when cleaning cache of root resource", () => {
    it("should execute clean listeners", () => {
      let called = false;
      expect.assertions(1);
      const books = new Axios({ id: "/books" });
      books.on("cleanCache", () => {
        called = true;
      });

      books.cleanCache();
      expect(called).toEqual(true);
    });

    it("should execute onceClean listeners only once", () => {
      let callCounter = 0;
      expect.assertions(1);
      const books = new Axios({ id: "/books" });
      books.once("cleanCache", () => {
        callCounter++;
      });

      books.cleanCache();
      books.cleanCache();
      expect(callCounter).toEqual(1);
    });

    it("should not execute clean listeners if were removed", () => {
      let called = false;
      expect.assertions(1);
      const books = new Axios({ id: "/books" });
      const setCalled = () => {
        called = true;
      };
      const removeListener = books.on("cleanCache", setCalled);
      removeListener();

      books.cleanCache();
      expect(called).toEqual(false);
    });

    it("should execute clean listeners of queried reproviders", () => {
      let called = false;
      let queriedCalled = false;
      expect.assertions(2);
      const books = new Axios({ id: "/books" });
      const queriedBooks = books.query("foo");
      books.on("cleanCache", () => {
        called = true;
      });
      queriedBooks.on("cleanCache", () => {
        queriedCalled = true;
      });

      books.cleanCache();
      expect(called).toEqual(true);
      expect(queriedCalled).toEqual(true);
    });
  });

  describe("when cleaning cache of a queried source", () => {
    it("should execute clean listeners, and cleanAny listeners", () => {
      let called = false;
      let anyCalled = false;
      expect.assertions(2);
      const books = new Axios({ id: "/books" });
      const queriedBooks = books.query("foo");

      books.onChild("cleanCache", () => {
        anyCalled = true;
      });

      queriedBooks.on("cleanCache", () => {
        called = true;
      });

      queriedBooks.cleanCache();
      expect(called).toEqual(true);
      expect(anyCalled).toEqual(true);
    });

    it("should not execute clean listeners nor cleanAny listeners if were removed", () => {
      let called = false;
      let anyCalled = false;
      expect.assertions(2);
      const books = new Axios({ id: "/books" });
      const queriedBooks = books.query("foo");

      const setCalled = () => {
        called = true;
      };

      const setAnyCalled = () => {
        anyCalled = true;
      };

      const removeListener = books.onChild("cleanCache", setAnyCalled);
      removeListener();

      const removeListener2 = queriedBooks.on("cleanCache", setCalled);
      removeListener2();

      queriedBooks.cleanCache();
      expect(called).toEqual(false);
      expect(anyCalled).toEqual(false);
    });
  });

  describe("when any property change", () => {
    it("should execute change listeners", async () => {
      let called = false;
      expect.assertions(1);
      const books = new Axios({ id: "/books" });
      books.on("*", () => {
        called = true;
      });

      await books.read();
      expect(called).toEqual(true);
    });

    it("should not execute change listeners if were removed", async () => {
      let called = false;
      expect.assertions(1);
      const books = new Axios({ id: "/books" });
      const setCalled = () => {
        called = true;
      };
      const removeListener = books.on("*", setCalled);
      removeListener();

      await books.read();
      expect(called).toEqual(false);
    });
  });

  describe("when any property of a queried source change", () => {
    it("should execute change listeners, and changeAny listeners", async () => {
      expect.assertions(2);
      let called = false;
      let calledAny = false;

      const books = new Axios({ id: "/books" });
      const queriedBooks = books.query("foo");

      books.onChild("*", () => {
        calledAny = true;
      });

      queriedBooks.on("*", () => {
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

      const books = new Axios({ id: "/books" });
      const queriedBooks = books.query("foo");

      const setCalled = () => {
        called = true;
      };

      const setAnyCalled = () => {
        calledAny = true;
      };

      const removeListener = books.onChild("*", setAnyCalled);
      removeListener();

      const removeListener2 = queriedBooks.on("*", setCalled);
      removeListener2();

      await queriedBooks.read();
      await wait();
      expect(called).toEqual(false);
      expect(calledAny).toEqual(false);
    });
  });
});
