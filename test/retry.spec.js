/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

describe("retry config", () => {
  let apiStatsCallCount;
  let apiStatsReset;
  let booksServerError;

  beforeAll(async () => {
    providers.getByTag("mocks").config({
      baseUrl: "http://localhost:3100",
    });

    apiStatsReset = new Axios(null, { url: "/api/stats/reset", tags: ["mocks"] });
    await apiStatsReset.create();

    apiStatsCallCount = new Axios(null, {
      url: "/api/stats/call-count",
      cache: false,
      tags: ["mocks"],
    });

    booksServerError = new Axios(null, {
      url: "/api/books/server-error",
      tags: ["mocks"],
      initialState: {
        data: [],
      },
    });
  });

  afterEach(async () => {
    await apiStatsReset.create();
  });

  afterAll(() => {
    providers.clear();
  });

  describe("when api GET fails with a 500 error", () => {
    it("should retry 3 times by default", async () => {
      expect.assertions(1);
      try {
        await booksServerError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.serverError).toEqual(4);
      }
    });

    it("should retry 10 times if config is changed", async () => {
      expect.assertions(1);
      booksServerError.config({
        retries: 10,
      });
      try {
        await booksServerError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.serverError).toEqual(11);
      }
    });

    it("should retry 5 times if config is changed using tag method", async () => {
      expect.assertions(1);
      providers.getByTag("mocks").config({
        retries: 5,
      });
      try {
        await booksServerError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.serverError).toEqual(6);
      }
    });

    it("should not retry if config is set to 0", async () => {
      expect.assertions(1);
      booksServerError.config({
        retries: 0,
      });
      try {
        await booksServerError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.serverError).toEqual(1);
      }
    });

    it("should not retry if config is set to 0 using tag method for all apis", async () => {
      expect.assertions(1);
      providers.getByTag("api").config({
        retries: 0,
      });
      try {
        await booksServerError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.serverError).toEqual(1);
      }
    });
  });

  describe("when api GET fails with a 404 error", () => {
    it("should not retry", async () => {
      const booksNotFoundError = new Axios(null, {
        url: "/api/books/not-found-error",
        retries: 3,
        tags: ["mocks"],
      });
      expect.assertions(1);
      try {
        await booksNotFoundError.read();
      } catch (err) {
        const stats = await apiStatsCallCount.read();
        expect(stats.books.notFoundError).toEqual(1);
      }
    });
  });
});
