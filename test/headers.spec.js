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

describe("Axios configuration", () => {
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

  beforeEach(() => {
    axios.stubs.instance.resolves({
      data: "foo"
    });
    axios.stubs.instance.resetHistory();
  });

  describe("setHeaders method", () => {
    const headers = {
      foo: "foo-1",
      foo2: "foo-2"
    };
    it("should set the requests headers", async () => {
      expect.assertions(1);
      const books = new Axios("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
    });

    it("should override all headers", async () => {
      expect.assertions(2);
      const newHeaders = { ...headers, foo2: "foo-new-2" };
      const books = new Axios("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
      books.setHeaders(newHeaders);
      books.cleanCache();
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].headers).toEqual(newHeaders);
    });
  });

  describe("addHeaders method", () => {
    const headers = {
      foo: "foo-1",
      foo2: "foo-2"
    };
    it("should add new headers to requests headers", async () => {
      expect.assertions(2);
      const newHeaders = {
        foo3: "foo-3"
      };
      const books = new Axios("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
      books.addHeaders(newHeaders);
      books.cleanCache();
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].headers).toEqual({
        foo: "foo-1",
        foo2: "foo-2",
        foo3: "foo-3"
      });
    });

    it("should override already existing headers", async () => {
      expect.assertions(2);
      const newHeaders = {
        foo2: "foo-4",
        foo3: "foo-3"
      };
      const books = new Axios("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
      books.addHeaders(newHeaders);
      books.cleanCache();
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].headers).toEqual({
        foo: "foo-1",
        foo2: "foo-4",
        foo3: "foo-3"
      });
    });
  });
});
