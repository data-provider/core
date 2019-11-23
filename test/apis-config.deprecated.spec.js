/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { Api, apis } = require("../src/index");

describe("apis config method", () => {
  let testsApis = [];

  beforeAll(() => {
    apis.reset();
  });

  afterAll(() => {
    apis.config({
      expirationTime: 0
    });
    apis.reset();
  });

  describe("when configuring each api", () => {
    describe("if no apis.config method was called", () => {
      it("should set received api configuration", () => {
        const api = new Api("/foo-1", {
          retries: 5
        });
        testsApis.push(api);
        expect(api._configuration.retries).toEqual(5);
      });
    });

    describe("if apis.config method was called previously", () => {
      it("should inherit common config previously defined", () => {
        apis.config({
          retries: 5
        });
        const api = new Api("/foo-2");
        testsApis.push(api);
        expect(api._configuration.retries).toEqual(5);
      });

      it("should inherit common config previously defined even when api is tagged", () => {
        const api = new Api("/foo-3", {
          tags: "foo-tag-1"
        });
        testsApis.push(api);
        expect(api._configuration.retries).toEqual(5);
      });
    });

    describe("if apis.config method was called previously for an specific tag", () => {
      describe("when provided tag is an string", () => {
        it("should inherit common config previously defined, and config previously defined for the tag", () => {
          apis.config(
            {
              expirationTime: 10
            },
            "foo-tag-1"
          );
          const api = new Api("/foo-4", {
            tags: "foo-tag-1"
          });
          testsApis.push(api);
          expect(api._configuration.expirationTime).toEqual(10);
          expect(api._configuration.retries).toEqual(5);
        });

        it("should inherit common config, and do not inherit config previously defined for the tag if it does not match", () => {
          const api = new Api("/foo-5", {
            tags: "foo-tag-2"
          });
          testsApis.push(api);
          expect(api._configuration.expirationTime).toEqual(0);
          expect(api._configuration.retries).toEqual(5);
        });
      });

      describe("when different values are provided for same option in different tags", () => {
        beforeEach(() => {
          apis.config(
            {
              retries: 10
            },
            ["foo-retries-1"]
          );
          apis.config(
            {
              retries: 20
            },
            ["foo-retries-2"]
          );
        });

        it("should get the value of defined tag if there is no tags conflict", () => {
          const api = new Api("/foo-6", {
            tags: ["foo-retries-1"]
          });
          expect(api._configuration.retries).toEqual(10);
        });

        it("should get the value of last defined tag if there is tags conflict", () => {
          expect.assertions(2);
          let api = new Api("/foo-6", {
            tags: ["foo-retries-1", "foo-retries-2"]
          });
          expect(api._configuration.retries).toEqual(20);
          api = new Api("/foo-6", {
            tags: ["foo-retries-2", "foo-retries-1"]
          });
          expect(api._configuration.retries).toEqual(10);
        });
      });

      describe("when provided tag is an array", () => {
        it("should inherit common config previously defined, and config previously defined for the tag if one of them match", () => {
          expect.assertions(2);
          apis.config(
            {
              expirationTime: 10
            },
            "foo-tag-1"
          );
          const api = new Api("/foo-6", {
            tags: ["foo-tag-1", "foo-tag-3"]
          });
          testsApis.push(api);
          expect(api._configuration.expirationTime).toEqual(10);
          expect(api._configuration.retries).toEqual(5);
        });

        it("should inherit common config, and do not inherit config previously defined for the tag if it does not match", () => {
          expect.assertions(2);
          const api = new Api("/foo-7", {
            tags: ["foo-tag-2", "foo-tag-3"]
          });
          testsApis.push(api);
          expect(api._configuration.expirationTime).toEqual(0);
          expect(api._configuration.retries).toEqual(5);
        });
      });
    });
  });

  describe("when calling config after apis have been created", () => {
    describe("if no tags are defined", () => {
      it("should set configuration for all existant apis", () => {
        apis.config({
          retries: 7
        });
        testsApis.forEach(testApi => {
          expect(testApi._configuration.retries).toEqual(7);
        });
      });
    });

    describe("if tag is defined as string", () => {
      it("should set configuration for all existant apis having a tag matching with it", () => {
        apis.config(
          {
            retries: 8
          },
          "foo-tag-3"
        );
        testsApis.forEach(testApi => {
          if (testApi._url === "/foo-6" || testApi._url === "/foo-7") {
            expect(testApi._configuration.retries).toEqual(8);
          } else {
            expect(testApi._configuration.retries).toEqual(7);
          }
        });
      });

      it("should not set configuration for any api if any have a matching tag", () => {
        apis.config(
          {
            retries: 12
          },
          "foo-tag-unexistant"
        );
        testsApis.forEach(testApi => {
          if (testApi._url === "/foo-6" || testApi._url === "/foo-7") {
            expect(testApi._configuration.retries).toEqual(8);
          } else {
            expect(testApi._configuration.retries).toEqual(7);
          }
        });
      });
    });

    describe("if tag is an array", () => {
      it("should set configuration for all existant apis having a tag matching with it", () => {
        apis.config(
          {
            retries: 9
          },
          ["foo-tag-3"]
        );
        testsApis.forEach(testApi => {
          if (testApi._url === "/foo-6" || testApi._url === "/foo-7") {
            expect(testApi._configuration.retries).toEqual(9);
          } else {
            expect(testApi._configuration.retries).toEqual(7);
          }
        });
      });

      it("should not set configuration for any existant apis if any has a tag matching with it", () => {
        apis.config(
          {
            retries: 15
          },
          ["foo-unexistant"]
        );
        testsApis.forEach(testApi => {
          if (testApi._url === "/foo-6" || testApi._url === "/foo-7") {
            expect(testApi._configuration.retries).toEqual(9);
          } else {
            expect(testApi._configuration.retries).toEqual(7);
          }
        });
      });
    });
  });
});
