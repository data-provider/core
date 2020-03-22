/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

describe("axios requests", () => {
  const BOOKS_RESULT = [
    {
      author: "Ray Bradbury",
      title: "Fahrenheit 451",
    },
  ];
  let apiStatsReset;
  let apiStatsCallCount;
  let booksSuccess;

  beforeAll(async () => {
    providers.getByTag("mocks").config({
      baseUrl: "http://localhost:3100",
    });

    apiStatsReset = new Axios("reset-stats", {
      url: "/api/stats/reset",
      tags: ["mocks"],
    });
    await apiStatsReset.create();

    apiStatsCallCount = new Axios("call-count", {
      url: "/api/stats/call-count",
      cache: false,
      tags: ["mocks"],
    });

    booksSuccess = new Axios("books-success", {
      url: "/api/books/success",
      tags: ["mocks"],
      initialState: {
        data: [],
      },
    });
  });

  afterEach(async () => {
    booksSuccess.cleanCache();
    await apiStatsReset.create();
  });

  afterAll(() => {
    providers.clear();
  });

  describe("when api GET is success", () => {
    it("should return result", async () => {
      expect.assertions(1);
      const books = await booksSuccess.read();
      expect(books).toEqual(BOOKS_RESULT);
    });

    it("should not repeat request by default", async () => {
      expect.assertions(2);
      await booksSuccess.read();
      await booksSuccess.read();
      await booksSuccess.read();
      await booksSuccess.read();
      await booksSuccess.read();
      await booksSuccess.read();
      const books = await booksSuccess.read();
      expect(books).toEqual(BOOKS_RESULT);
      const stats = await apiStatsCallCount.read();
      expect(stats.books.success).toEqual(1);
    });

    it("should repeat request if cache is disabled", async () => {
      expect.assertions(2);
      booksSuccess.config({
        cache: false,
      });
      await booksSuccess.read();
      await booksSuccess.read();
      await booksSuccess.read();
      const books = await booksSuccess.read();
      expect(books).toEqual(BOOKS_RESULT);
      const stats = await apiStatsCallCount.read();
      expect(stats.books.success).toEqual(4);
    });
  });
});
