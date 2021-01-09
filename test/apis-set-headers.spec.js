/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

describe("apis setHeaders method", () => {
  let testsAxios = [];

  beforeAll(() => {
    providers.clear();
  });

  afterAll(() => {
    providers.clear();
  });

  describe("when creating api", () => {
    describe("if apis setHeaders method was not called previously", () => {
      it("should not set any header", () => {
        const api = new Axios({ id: "foo-1", url: "/foo-1" });
        testsAxios.push(api);
        expect(api.headers).toEqual({});
      });
    });

    describe("if providers config method was called previously defining headers", () => {
      it("should inherit common headers previously defined", () => {
        providers.config({
          headers: {
            foo: "foo",
          },
        });
        const api = new Axios({ id: "foo-2", url: "/foo-2" });
        testsAxios.push(api);
        expect(api.headers).toEqual({
          foo: "foo",
        });
      });

      it("should inherit common headers previously defined even when api is tagged", () => {
        const api = new Axios({ id: "foo-3", url: "/foo-3", tags: ["foo-tag-1"] });
        testsAxios.push(api);
        expect(api.headers).toEqual({
          foo: "foo",
        });
      });
    });

    describe("if providers config method is called redefining headers for an specific tag", () => {
      it("should have no effect", () => {
        providers.getByTag("foo-tag-1").config({
          headers: {
            foo2: "foo2",
          },
        });
        const api = new Axios({ id: "foo-4", url: "/foo-4", tags: ["foo-tag-1"] });
        testsAxios.push(api);
        expect(api.headers.foo).toEqual("foo");
        expect(api.headers.foo2).toEqual(undefined);
      });
    });
  });

  describe("when calling setHeaders after apis have been created", () => {
    describe("if no tags are defined", () => {
      it("should set headers for all existant apis, removing all previously defined headers", () => {
        providers.call("setHeaders", {
          foo: "new-foo",
        });
        testsAxios.forEach((testAxios) => {
          expect(testAxios.headers.foo).toEqual("new-foo");
          expect(testAxios.headers.foo2).toEqual(undefined);
          expect(testAxios.headers.foo3).toEqual(undefined);
        });
      });
    });

    describe("if tag is defined as string", () => {
      it("should set headers for all existant apis having a tag matching with it", () => {
        providers.getByTag("foo-tag-3").call("setHeaders", {
          foo: "another-foo",
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.headers.foo).toEqual("another-foo");
          } else {
            expect(testAxios.headers.foo).toEqual("new-foo");
          }
        });
      });

      it("should not set configuration for any api if any have a matching tag", () => {
        providers.getByTag("foo-tag-4").call("setHeaders", {
          foo: "fake-foo",
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.headers.foo).toEqual("another-foo");
          } else {
            expect(testAxios.headers.foo).toEqual("new-foo");
          }
        });
      });
    });

    describe("if tag is an array", () => {
      it("should set configuration for all existant apis having a tag matching with it", () => {
        providers.getByTag("foo-tag-3").call("setHeaders", {
          foo: "another-new-foo",
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.headers.foo).toEqual("another-new-foo");
          } else {
            expect(testAxios.headers.foo).toEqual("new-foo");
          }
        });
      });

      it("should not set configuration for any existant apis if any has a tag matching with it", () => {
        providers.getByTag("foo-unexistant").call("setHeaders", {
          foo: "fake-foo",
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.headers.foo).toEqual("another-new-foo");
          } else {
            expect(testAxios.headers.foo).toEqual("new-foo");
          }
        });
      });
    });
  });
});
