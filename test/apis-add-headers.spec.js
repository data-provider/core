/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

describe("apis addHeaders method", () => {
  let testsAxios = [];

  beforeAll(() => {
    providers.clear();
  });

  afterAll(() => {
    providers.clear();
  });

  describe("when creating api", () => {
    describe("if apis addHeaders method is not called", () => {
      it("should not set any header", () => {
        const api = new Axios("foo-1", {
          url: "/foo-1",
        });
        testsAxios.push(api);
        expect(api.headers).toEqual({});
      });
    });

    describe("if providers.addHeaders method is called", () => {
      it("should inherit common headers previously defined in config", () => {
        providers.getByTag("axios").config({
          headers: {
            foo: "foo",
          },
        });
        const api = new Axios("foo-2", {
          url: "/foo-2",
        });
        testsAxios.push(api);
        expect(api.headers).toEqual({
          foo: "foo",
        });
      });

      it("should apply added headers", () => {
        const api = new Axios("foo-2b", {
          url: "/foo-2",
        });
        providers.call("addHeaders", {
          foo2: "foo2",
        });
        testsAxios.push(api);
        expect(api.headers).toEqual({
          foo: "foo",
          foo2: "foo2",
        });
      });

      it("should inherit common headers previously defined even when api is tagged", () => {
        const api = new Axios("foo-3", {
          url: "/foo-3",
          tags: ["foo-tag-1"],
        });
        testsAxios.push(api);
        expect(api.headers).toEqual({
          foo: "foo",
        });
      });
    });
  });

  describe("when calling addHeaders after apis have been created", () => {
    describe("if no tags are defined", () => {
      it("should set headers for all existant apis, maintaning all previously added headers", () => {
        providers.call("addHeaders", {
          foo2: "foo2",
        });
        testsAxios.forEach((testAxios) => {
          expect(testAxios.headers.foo).toEqual("foo");
          expect(testAxios.headers.foo2).toEqual("foo2");
        });
      });
    });

    describe("if tag is defined", () => {
      it("should set headers for all existant apis having a tag matching with it", () => {
        providers.getByTag("foo-tag-3").call("addHeaders", {
          foo: "another-foo",
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.headers.foo).toEqual("another-foo");
          } else {
            expect(testAxios.headers.foo).toEqual("foo");
          }
        });
      });

      it("should not set configuration for any api if any have a matching tag", () => {
        providers.getByTag("foo-tag-4").call("addHeaders", {
          foo: "fake-foo",
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.headers.foo).toEqual("another-foo");
          } else {
            expect(testAxios.headers.foo).toEqual("foo");
          }
        });
      });
    });
  });
});
