/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

const TAG = "axios";

describe("providers config method", () => {
  let testsAxios = [];
  let allAxiosSources;

  beforeAll(() => {
    allAxiosSources = providers.getByTag(TAG);
    allAxiosSources.clear();
  });

  afterAll(() => {
    allAxiosSources.config({
      expirationTime: 0,
    });
    allAxiosSources.clear();
  });

  describe("when configuring each api", () => {
    describe("if no providers.config method was called", () => {
      it("should set received api configuration", () => {
        const api = new Axios({ id: "foo-1", url: "/foo-1", retries: 5 });
        testsAxios.push(api);
        expect(api.options.retries).toEqual(5);
      });
    });

    describe("if providers.config method was called previously", () => {
      it("should inherit common config previously defined", () => {
        allAxiosSources.config({
          retries: 5,
        });
        const api = new Axios({ id: "foo-2", url: "/foo-2" });
        testsAxios.push(api);
        expect(api.options.retries).toEqual(5);
      });

      it("should inherit common config previously defined even when api is tagged", () => {
        const api = new Axios({ id: "foo-3", url: "/foo-3", tags: ["foo-tag-1"] });
        testsAxios.push(api);
        expect(api.options.retries).toEqual(5);
      });
    });

    describe("if providers.config method was called previously for an specific tag", () => {
      describe("when provided tag is an string", () => {
        it("should inherit common config previously defined, and config previously defined for the tag", () => {
          providers.getByTag("foo-tag-1").config({
            expirationTime: 10,
          });
          const api = new Axios({ id: "foo-4", url: "foo-4", tags: ["foo-tag-1"] });
          testsAxios.push(api);
          expect(api.options.expirationTime).toEqual(10);
          expect(api.options.retries).toEqual(5);
        });

        it("should inherit common config, and do not inherit config previously defined for the tag if it does not match", () => {
          const api = new Axios({ id: "foo-5", url: "foo-5", tags: ["foo-tag-2"] });
          testsAxios.push(api);
          expect(api.options.expirationTime).toEqual(0);
          expect(api.options.retries).toEqual(5);
        });
      });

      describe("when different values are provided for same option in different tags", () => {
        beforeEach(() => {
          providers.getByTag("foo-retries-1").config({
            retries: 10,
          });
          providers.getByTag("foo-retries-2").config({
            retries: 20,
          });
        });

        it("should get the value of defined tag if there is no tags conflict", () => {
          const api = new Axios({ id: "foo-6", url: "/foo-6", tags: ["foo-retries-1"] });
          expect(api.options.retries).toEqual(10);
        });

        it("should get the value of last defined tag if there is tags conflict", () => {
          expect.assertions(2);
          let api = new Axios({
            id: "foo-6b",
            url: "/foo-6",
            tags: ["foo-retries-1", "foo-retries-2"],
          });
          expect(api.options.retries).toEqual(20);
          api = new Axios({
            id: "foo-6c",
            url: "/foo-6b",
            tags: ["foo-retries-2", "foo-retries-1"],
          });
          expect(api.options.retries).toEqual(10);
        });
      });

      describe("when provided tag is an array", () => {
        it("should inherit common config previously defined, and config previously defined for the tag if one of them match", () => {
          expect.assertions(2);
          providers.getByTag("foo-tag-1").config({
            expirationTime: 10,
          });
          const api = new Axios({ id: "foo-6d", url: "/foo-6", tags: ["foo-tag-1", "foo-tag-3"] });
          testsAxios.push(api);
          expect(api.options.expirationTime).toEqual(10);
          expect(api.options.retries).toEqual(5);
        });

        it("should inherit common config, and do not inherit config previously defined for the tag if it does not match", () => {
          expect.assertions(2);
          const api = new Axios({ id: "foo-7", url: "/foo-7", tags: ["foo-tag-2", "foo-tag-3"] });
          testsAxios.push(api);
          expect(api.options.expirationTime).toEqual(0);
          expect(api.options.retries).toEqual(5);
        });
      });
    });
  });

  describe("when calling config after apis have been created", () => {
    describe("if no tags are defined", () => {
      it("should set configuration for all existant apis", () => {
        allAxiosSources.config({
          retries: 7,
        });
        testsAxios.forEach((testAxios) => {
          expect(testAxios.options.retries).toEqual(7);
        });
      });
    });

    describe("if tag is defined as string", () => {
      it("should set configuration for all existant apis having a tag matching with it", () => {
        providers.getByTag("foo-tag-3").config({
          retries: 8,
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.options.retries).toEqual(8);
          } else {
            expect(testAxios.options.retries).toEqual(7);
          }
        });
      });

      it("should not set configuration for any api if any have a matching tag", () => {
        providers.getByTag("foo-tag-unexistant").config({
          retries: 12,
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.options.retries).toEqual(8);
          } else {
            expect(testAxios.options.retries).toEqual(7);
          }
        });
      });
    });

    describe("if tag is an array", () => {
      it("should set configuration for all existant apis having a tag matching with it", () => {
        providers.getByTag("foo-tag-3").config({
          retries: 9,
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.options.retries).toEqual(9);
          } else {
            expect(testAxios.options.retries).toEqual(7);
          }
        });
      });

      it("should not set configuration for any existant apis if any has a tag matching with it", () => {
        providers.getByTag("foo-unexistant").config({
          retries: 15,
        });
        testsAxios.forEach((testAxios) => {
          if (testAxios._url === "/foo-6" || testAxios._url === "/foo-7") {
            expect(testAxios.options.retries).toEqual(9);
          } else {
            expect(testAxios.options.retries).toEqual(7);
          }
        });
      });
    });
  });
});
