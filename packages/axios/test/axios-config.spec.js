/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");

const { DEFAULT_BASE_PATH, SETTINGS } = require("@mocks-server/admin-api-paths");
const crossFetch = require("cross-fetch");
const { Axios } = require("../src/index");

describe("axios config", () => {
  let books;
  const mocksSettingsUrl = `http://127.0.0.1:3100${DEFAULT_BASE_PATH}${SETTINGS}`;

  beforeAll(async () => {
    await crossFetch(mocksSettingsUrl, {
      method: "PATCH",
      body: JSON.stringify({
        mocks: {
          delay: 3000,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    books = new Axios({
      id: "books",
      url: "/api/books/success",
      baseUrl: "http://127.0.0.1:3100",
      axiosConfig: {
        timeout: 1000,
      },
      initialState: {
        data: [],
      },
    });
  });

  afterAll(async () => {
    providers.clear();
    await crossFetch(mocksSettingsUrl, {
      method: "PATCH",
      body: JSON.stringify({
        mocks: {
          delay: 0,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  describe("when timeout axios config is provided", () => {
    it("should stop request when defined time is reached", async () => {
      expect.assertions(1);
      try {
        await books.read();
      } catch (err) {
        expect(err.message).toEqual(expect.stringContaining("timeout of 1000ms exceeded"));
      }
    });
  });
});
