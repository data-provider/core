/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");
const { defaultOptions } = require("../../src/helpers");

describe("providers handler config method", () => {
  let sandbox;
  let fooProvider;
  let fooProvider2;
  let fooProvider3;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fooProvider = new Provider({ id: "foo-1", tags: "tag-1" });
    fooProvider2 = new Provider({ id: "foo-2", tags: ["tag-2", "tag-3"] });
    fooProvider3 = new Provider({ id: "foo-3", tags: "tag-3" });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when applied to all providers", () => {
    it("should apply config to all providers", () => {
      providers.config({
        foo: "foo",
      });

      expect(fooProvider.options.foo).toEqual("foo");
      expect(fooProvider2.options.foo).toEqual("foo");
      expect(fooProvider3.options.foo).toEqual("foo");
    });

    it("should extend current configuration of all providers", () => {
      providers.config({
        foo: "foo",
      });

      expect(fooProvider.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: "tag-1",
        id: "foo-1",
      });
      expect(fooProvider2.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: ["tag-2", "tag-3"],
        id: "foo-2",
      });
      expect(fooProvider3.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: "tag-3",
        id: "foo-3",
      });
    });

    // TODO, test config chainability
    // TODO, test tags extension order

    it("should be applied to new created providers", () => {
      providers.config({
        foo: "foo",
      });

      const fooProvider4 = new Provider({ id: "foo-4" });

      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        id: "foo-4",
      });
    });

    it("should extend previously defined configuration", () => {
      providers.config({
        foo: "foo",
        foo2: "foo2",
      });

      const fooProvider4 = new Provider({ id: "foo-4" });

      providers.config({
        foo2: "new-foo2",
        foo3: "foo3",
      });

      expect(fooProvider.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: "tag-1",
        id: "foo-1",
      });
      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        id: "foo-4",
      });
    });
  });

  describe("when applied to groups of providers using getByTag method", () => {
    it("should apply config to all providers in group", () => {
      providers.getByTag("tag-3").config({
        foo: "foo",
      });

      expect(fooProvider2.options.foo).toEqual("foo");
      expect(fooProvider3.options.foo).toEqual("foo");
    });

    it("should not apply config to non-belonging providers", () => {
      providers.getByTag("tag-3").config({
        foo: "foo",
      });

      expect(fooProvider.options.foo).toEqual(undefined);
    });

    it("should extend current configuration of all providers belonging to group", () => {
      providers.getByTag("tag-3").config({
        foo: "foo",
      });

      expect(fooProvider.options).toEqual({
        ...defaultOptions,
        tags: "tag-1",
        id: "foo-1",
      });
      expect(fooProvider2.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: ["tag-2", "tag-3"],
        id: "foo-2",
      });
      expect(fooProvider3.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: "tag-3",
        id: "foo-3",
      });
    });

    it("should be applied to new created providers", () => {
      providers.getByTag("tag-4").config({
        foo: "foo",
      });

      const fooProvider4 = new Provider({ id: "foo-4", tags: "tag-4" });

      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: "tag-4",
        id: "foo-4",
      });
    });

    it("should be applied to new created providers containing tag", () => {
      providers.getByTag("tag-4").config({
        foo: "foo",
      });

      const fooProvider4 = new Provider({ id: "foo-4", tags: ["tag-4", "tag-2"] });

      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: ["tag-4", "tag-2"],
        id: "foo-4",
      });
    });

    it("should extend previously defined configuration", () => {
      providers.getByTag("tag-3").config({
        foo: "foo",
        foo2: "foo2",
      });

      const fooProvider4 = new Provider({ id: "foo-4", tags: "tag-3" });

      providers.getByTag("tag-3").config({
        foo2: "new-foo2",
        foo3: "foo3",
      });

      expect(fooProvider.options).toEqual({
        ...defaultOptions,
        tags: "tag-1",
        id: "foo-1",
      });
      expect(fooProvider2.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-2", "tag-3"],
        id: "foo-2",
      });
      expect(fooProvider3.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: "tag-3",
        id: "foo-3",
      });
      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: "tag-3",
        id: "foo-4",
      });
    });

    it("should extend previously defined configuration when creating source containing tag", () => {
      providers.getByTag("tag-3").config({
        foo: "foo",
        foo2: "foo2",
      });

      const fooProvider4 = new Provider({ id: "foo-4", tags: ["tag-3", "tag-5"] });

      providers.getByTag("tag-3").config({
        foo2: "new-foo2",
        foo3: "foo3",
      });

      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        tags: ["tag-3", "tag-5"],
        id: "foo-4",
      });
    });
  });

  describe("When base tags are defined in the addon", () => {
    let FooAddon;
    let fooProvider4;
    let fooProvider5;
    beforeEach(() => {
      FooAddon = class extends Provider {
        readMethod() {
          return Promise.resolve();
        }
        get baseTags() {
          return ["tag-3"];
        }
      };

      fooProvider4 = new FooAddon({ id: "foo-4" });
      fooProvider5 = new FooAddon({ id: "foo-5", tags: "tag-5" });
    });

    describe("tags getter", () => {
      it("should return tags from baseTags extended with tags option", () => {
        expect(fooProvider4.tags).toEqual(["tag-3"]);
        expect(fooProvider5.tags).toEqual(["tag-3", "tag-5"]);
      });

      it("should return only tags from options if addon has not defined baseTags", () => {
        const FooAddon2 = class extends Provider {
          readMethod() {
            return Promise.resolve();
          }
        };
        const fooProvider6 = new FooAddon2({ id: "foo-6", tags: "tag-5" });
        expect(fooProvider6.tags).toEqual(["tag-5"]);
      });

      it("should return tags from baseTags extended with tags option even when baseTags return an string", () => {
        const FooAddon2 = class extends Provider {
          readMethod() {
            return Promise.resolve();
          }
          get baseTags() {
            return "tag-3";
          }
        };
        const fooProvider6 = new FooAddon2({ id: "foo-6", tags: "tag-5" });
        expect(fooProvider6.tags).toEqual(["tag-3", "tag-5"]);
      });
    });

    describe("when applied to groups of providers using getByTag method", () => {
      it("should apply config to all providers in group", () => {
        providers.getByTag("tag-3").config({
          foo: "foo",
        });

        expect(fooProvider5.options.foo).toEqual("foo");
        expect(fooProvider4.options.foo).toEqual("foo");
        expect(fooProvider2.options.foo).toEqual("foo");
        expect(fooProvider3.options.foo).toEqual("foo");
      });

      it("should not apply config to non-belonging providers", () => {
        providers.getByTag("tag-5").config({
          foo: "foo",
        });

        expect(fooProvider5.options.foo).toEqual("foo");
        expect(fooProvider4.options.foo).toEqual(undefined);
      });

      it("should extend previously defined configuration when creating source containing tag", () => {
        providers.getByTag("tag-3").config({
          foo: "foo",
          foo2: "foo2",
        });

        const fooProvider6 = new FooAddon({ id: "foo-6", tags: ["tag-5", "tag-6"] });

        providers.getByTag("tag-3").config({
          foo2: "new-foo2",
          foo3: "foo3",
        });

        expect(fooProvider6.options).toEqual({
          ...defaultOptions,
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-5", "tag-6"],
          id: "foo-6",
        });

        expect(fooProvider6.tags).toEqual(["tag-3", "tag-5", "tag-6"]);
      });
    });
  });

  describe("selectors tag", () => {
    let fooSelector;
    let fooSelector2;
    beforeEach(() => {
      fooSelector = new Selector(() => {});
      fooSelector2 = new Selector(() => {}, { tags: "tag-5" });
    });

    describe("tags getter", () => {
      it("should return selector tag extended with tags option", () => {
        expect(fooSelector.tags).toEqual(["selector"]);
        expect(fooSelector2.tags).toEqual(["selector", "tag-5"]);
      });
    });

    describe("when applied to groups of providers using getByTag method", () => {
      it("should apply config to all providers in group", () => {
        providers.getByTag("selector").config({
          foo: "foo",
        });

        expect(fooSelector.options.foo).toEqual("foo");
        expect(fooSelector2.options.foo).toEqual("foo");
      });

      it("should not apply config to non-belonging selectors", () => {
        providers.getByTag("tag-5").config({
          foo: "foo",
        });

        expect(fooSelector2.options.foo).toEqual("foo");
        expect(fooSelector.options.foo).toEqual(undefined);
      });

      it("should extend previously defined configuration when creating source containing tag", () => {
        providers.getByTag("selector").config({
          foo: "foo",
          foo2: "foo2",
        });

        const fooSelector3 = new Selector(() => {}, { tags: ["tag-5", "tag-6"] });

        providers.getByTag("tag-6").config({
          foo2: "new-foo2",
          foo3: "foo3",
        });

        expect(fooSelector3.options).toEqual({
          ...defaultOptions,
          foo: "foo",
          foo2: "new-foo2",
          foo3: "foo3",
          tags: ["tag-5", "tag-6"],
        });

        expect(fooSelector3.tags).toEqual(["selector", "tag-5", "tag-6"]);
      });
    });
  });

  describe("when applied to groups of providers using getById method", () => {
    it("should apply config to source with id", () => {
      providers.getById("foo-2").config({
        foo: "foo",
      });

      expect(fooProvider2.options.foo).toEqual("foo");
    });

    it("should not apply config to non-belonging providers", () => {
      providers.getById("foo-2").config({
        foo: "foo",
      });

      expect(fooProvider.options.foo).toEqual(undefined);
    });

    it("should extend current configuration of instance with provided id", () => {
      providers.getById("foo-3").config({
        foo: "foo",
      });

      expect(fooProvider3.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        tags: "tag-3",
        id: "foo-3",
      });
    });

    it("should be applied to new created providers with same id", () => {
      providers.getById("foo-4").config({
        foo: "foo",
      });

      const fooProvider4 = new Provider({ id: "foo-4" });

      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        id: "foo-4",
      });
    });

    it("should extend previously defined configuration", () => {
      providers.getById("foo-4").config({
        foo: "foo",
        foo2: "foo2",
      });

      const fooProvider4 = new Provider({ id: "foo-4" });

      providers.getById("foo-4").config({
        foo2: "new-foo2",
        foo3: "foo3",
      });

      expect(fooProvider4.options).toEqual({
        ...defaultOptions,
        foo: "foo",
        foo2: "new-foo2",
        foo3: "foo3",
        id: "foo-4",
      });
    });
  });
});
