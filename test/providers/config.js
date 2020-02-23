/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("providers handler config method", () => {
  let sandbox;
  let fooProvider;
  let fooProvider2;
  let fooProvider3;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fooProvider = new Provider("foo-1", { tags: "tag-1" });
    fooProvider2 = new Provider("foo-2", { tags: ["tag-2", "tag-3"] });
    fooProvider3 = new Provider("foo-3", { tags: "tag-3" });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when applied to all providers", () => {
    it("should apply config to all providers", () => {
      providers.config({
        foo: "foo"
      });

      expect(fooProvider.options.foo).toEqual("foo");
      expect(fooProvider2.options.foo).toEqual("foo");
      expect(fooProvider3.options.foo).toEqual("foo");
    });

    it("should extend current configuration of all providers", () => {
      providers.config({
        foo: "foo"
      });

      expect(fooProvider.options).toEqual({
        cache: true,
        foo: "foo",
        tags: "tag-1"
      });
      expect(fooProvider2.options).toEqual({
        cache: true,
        foo: "foo",
        tags: ["tag-2", "tag-3"]
      });
      expect(fooProvider3.options).toEqual({
        cache: true,
        foo: "foo",
        tags: "tag-3"
      });
    });

    it("should be applied to new created providers", () => {
      providers.config({
        foo: "foo"
      });

      const fooProvider4 = new Provider("foo-4");

      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo"
      });
    });

    it("should extend previously defined configuration", () => {
      providers.config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooProvider4 = new Provider("foo-4");

      providers.config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      expect(fooProvider.options).toEqual({
        cache: true,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: "tag-1"
      });
      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3"
      });
    });
  });

  describe("when applied to groups of providers using getByTag method", () => {
    it("should apply config to all providers in group", () => {
      providers.getByTag("tag-3").config({
        foo: "foo"
      });

      expect(fooProvider2.options.foo).toEqual("foo");
      expect(fooProvider3.options.foo).toEqual("foo");
    });

    it("should not apply config to non-belonging providers", () => {
      providers.getByTag("tag-3").config({
        foo: "foo"
      });

      expect(fooProvider.options.foo).toEqual(undefined);
    });

    it("should extend current configuration of all providers belonging to group", () => {
      providers.getByTag("tag-3").config({
        foo: "foo"
      });

      expect(fooProvider.options).toEqual({
        cache: true,
        tags: "tag-1"
      });
      expect(fooProvider2.options).toEqual({
        cache: true,
        foo: "foo",
        tags: ["tag-2", "tag-3"]
      });
      expect(fooProvider3.options).toEqual({
        cache: true,
        foo: "foo",
        tags: "tag-3"
      });
    });

    it("should be applied to new created providers", () => {
      providers.getByTag("tag-4").config({
        foo: "foo"
      });

      const fooProvider4 = new Provider("foo-4", { tags: "tag-4" });

      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo",
        tags: "tag-4"
      });
    });

    it("should be applied to new created providers containing tag", () => {
      providers.getByTag("tag-4").config({
        foo: "foo"
      });

      const fooProvider4 = new Provider("foo-4", { tags: ["tag-4", "tag-2"] });

      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo",
        tags: ["tag-4", "tag-2"]
      });
    });

    it("should extend previously defined configuration", () => {
      providers.getByTag("tag-3").config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooProvider4 = new Provider("foo-4", { tags: "tag-3" });

      providers.getByTag("tag-3").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      expect(fooProvider.options).toEqual({
        cache: true,
        tags: "tag-1"
      });
      expect(fooProvider2.options).toEqual({
        cache: true,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-2", "tag-3"]
      });
      expect(fooProvider3.options).toEqual({
        cache: true,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: "tag-3"
      });
      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: "tag-3"
      });
    });

    it("should extend previously defined configuration when creating source containing tag", () => {
      providers.getByTag("tag-3").config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooProvider4 = new Provider("foo-4", { tags: ["tag-3", "tag-5"] });

      providers.getByTag("tag-3").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-3", "tag-5"]
      });
    });
  });

  describe("when applied to groups of providers using getById method", () => {
    it("should apply config to source with id", () => {
      providers.getById("foo-2").config({
        foo: "foo"
      });

      expect(fooProvider2.options.foo).toEqual("foo");
    });

    it("should not apply config to non-belonging providers", () => {
      providers.getById("foo-2").config({
        foo: "foo"
      });

      expect(fooProvider.options.foo).toEqual(undefined);
    });

    it("should extend current configuration of instance with provided id", () => {
      providers.getById("foo-3").config({
        foo: "foo"
      });

      expect(fooProvider3.options).toEqual({
        cache: true,
        foo: "foo",
        tags: "tag-3"
      });
    });

    it("should be applied to new created providers with same id", () => {
      providers.getById("foo-4").config({
        foo: "foo"
      });

      const fooProvider4 = new Provider("foo-4");

      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo"
      });
    });

    it("should extend previously defined configuration", () => {
      providers.getById("foo-4").config({
        foo: "foo",
        foo2: "foo2"
      });

      const fooProvider4 = new Provider("foo-4");

      providers.getById("foo-4").config({
        foo2: "new-foo2",
        foo3: "foo3"
      });

      expect(fooProvider4.options).toEqual({
        cache: true,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3"
      });
    });
  });
});
