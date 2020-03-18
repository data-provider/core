/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { providers } = require("@data-provider/core");
const Storage = require("./Storage.mock");

const { LocalStorage } = require("../src/LocalStorage");

describe("storage namespaces", () => {
  let storage;

  beforeEach(() => {
    storage = new Storage("sessionStorage");
  });

  afterEach(() => {
    storage.restore();
    providers.clear();
  });

  describe("should be the id", () => {
    it("should be equal to the provider id", () => {
      const provider = new LocalStorage("foo-id");
      expect(provider._namespace).toEqual("foo-id");
    });

    it("should be equal to the provider id for queried instances", () => {
      const provider = new LocalStorage("foo-id");
      provider.query({ foo: "foo" }).update("foo");
      expect(provider.query({ foo: "foo" })._namespace).toEqual("foo-id");
    });
  });
});
