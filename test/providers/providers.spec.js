/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, Selector } = require("../../src/index");

describe("providers handler", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("add method", () => {
    beforeEach(() => {
      sandbox.stub(console, "warn");
    });

    it("should print a trace when duplicated id is detected", () => {
      new Provider({ id: "foo-id" });
      new Provider({ id: "foo-id" });
      expect(console.warn.getCall(0).args[0]).toEqual(expect.stringContaining("foo-id"));
    });

    it("should not print a trace when providers have been clear", () => {
      new Provider({ id: "foo-id" });
      providers.clear();
      new Provider({ id: "foo-id" });
      expect(console.warn.callCount).toEqual(0);
    });
  });

  describe("elements getter", () => {
    it("should be empty if no providers have been created", () => {
      expect(providers.elements.length).toEqual(0);
    });

    it("should contain new created providers", () => {
      new Provider({ id: "foo-id" });
      expect(providers.elements[0]._id).toEqual("foo-id");
    });

    it("should contain as much elements as providers have been created", () => {
      const fooOrigin = new Provider({ id: "foo-id" });
      new Selector(fooOrigin, () => {}, {
        id: "foo-id-2",
      });
      expect(providers.elements[0]._id).toEqual("foo-id");
      expect(providers.elements[1]._id).toEqual("foo-id-2");
    });
  });

  describe("size getter", () => {
    it("should be zero if no providers have been created", () => {
      expect(providers.size).toEqual(0);
    });

    it("should contain new created providers", () => {
      new Provider();
      expect(providers.size).toEqual(1);
    });

    it("should contain as much elements as providers have been created", () => {
      const fooOrigin = new Provider();
      new Selector(fooOrigin, () => {});
      expect(providers.size).toEqual(2);
    });
  });

  describe("getById method", () => {
    it("should return handler of instance with provided id", () => {
      new Provider({ id: "foo" });
      const origin = new Provider({ id: "foo-id" });
      expect(providers.getById("foo-id").elements[0]).toEqual(origin);
    });

    it("should return only one element in elements property", () => {
      new Provider({ id: "foo" });
      new Provider({ id: "foo-2" });
      new Provider({ id: "foo-3" });
      expect(providers.getById("foo").elements.length).toEqual(1);
    });

    it("should return only one element in elements property even when id is duplicated", () => {
      new Provider({ id: "foo" });
      new Provider({ id: "foo-2" });
      new Provider({ id: "foo-3" });
      new Provider({ id: "foo" });
      expect(providers.getById("foo").elements.length).toEqual(1);
    });

    it("should return only one element", () => {
      new Provider({ id: "foo" });
      new Provider({ id: "foo-2" });
      new Provider({ id: "foo-3" });
      expect(providers.getById("foo").size).toEqual(1);
    });

    it("should not return an empty handler when id does not exist", () => {
      new Provider({ id: "foo" });
      new Provider({ id: "foo-2" });
      new Provider({ id: "foo-3" });
      expect(providers.getById("foo-id").size).toEqual(0);
    });

    it("should return element even when there was an id conflict", () => {
      new Provider({ id: "foo" });
      new Provider({ id: "foo-id" });
      const fooOrigin = new Provider({ id: "foo-id" });
      expect(providers.getById(fooOrigin.id).elements[0]).toEqual(fooOrigin);
    });
  });

  describe("getByTag method", () => {
    describe("when filtering only by one tag", () => {
      it("should return handler containing providers with provided tag", () => {
        const TAG = "foo-tag-2";
        new Provider({ id: "foo", tags: ["foo-tag"] });
        const origin = new Provider({ id: "foo-2", tags: TAG });
        const origin2 = new Provider({ id: "foo-3", tags: [TAG, "foo-tag-3"] });
        expect(providers.getByTag(TAG).size).toEqual(2);
        expect(providers.getByTag(TAG).elements[0]).toEqual(origin);
        expect(providers.getByTag(TAG).elements[1]).toEqual(origin2);
      });

      it("should return empty handler if no providers contain provided tag", () => {
        new Provider({ id: "foo", tags: ["foo-tag"] });
        new Provider({ id: "foo-2", tags: "foo-tag-2" });
        new Provider({ id: "foo-3", tags: ["foo-tag-2", "foo-tag-3"] });
        expect(providers.getByTag("foo-unexistant-tag").size).toEqual(0);
      });
    });
  });

  describe("onNewProvider method", () => {
    describe("when onNewProvider method is used in providers", () => {
      it("should execute callback each time a new provider is added", () => {
        const newProviders = [];
        providers.onNewProvider((provider) => {
          newProviders.push(provider);
        });
        const provider1 = new Provider({ id: "foo", tags: ["foo-tag"] });
        const provider2 = new Provider({ id: "foo2", tags: ["foo-tag"] });
        expect(newProviders).toEqual([provider1, provider2]);
      });

      it("should have provider id available when subscriber is executed", () => {
        const newProviders = [];
        providers.onNewProvider((provider) => {
          newProviders.push(provider.id);
        });
        new Provider({ id: "foo", tags: ["foo-tag"] });
        new Provider({ id: "foo2", tags: ["foo-tag"] });
        expect(newProviders).toEqual(["foo", "foo2"]);
      });

      it("should execute callback each time a new child provider is added", () => {
        const newProviders = [];
        providers.onNewProvider((provider) => {
          newProviders.push(provider);
        });
        const provider1 = new Provider({ id: "foo", tags: ["foo-tag"] });
        const provider2 = provider1.query({ foo: "foo" });
        expect(newProviders).toEqual([provider1, provider2]);
      });

      it("should have child provider id available when subscriber is executed", () => {
        const newProviders = [];
        providers.onNewProvider((provider) => {
          newProviders.push(provider.id);
        });
        const provider1 = new Provider({ id: "foo", tags: ["foo-tag"] });
        provider1.query({ foo: "foo" });
        expect(newProviders).toEqual(["foo", 'foo({"foo":"foo"})']);
      });
    });

    describe("when onNewProvider method is used in getByTag", () => {
      it("should execute callback each time a new provider is added", () => {
        const newProvidersTag1 = [];
        const newProvidersTag2 = [];
        providers.getByTag("foo-tag").onNewProvider((provider) => {
          newProvidersTag1.push(provider);
        });
        providers.getByTag("foo-tag2").onNewProvider((provider) => {
          newProvidersTag2.push(provider);
        });
        const provider1 = new Provider({ id: "foo", tags: ["foo-tag"] });
        const provider2 = new Provider({ id: "foo2", tags: ["foo-tag2"] });
        const provider3 = new Provider({ id: "foo2", tags: ["foo-tag"] });
        expect(newProvidersTag1).toEqual([provider1, provider3]);
        expect(newProvidersTag2).toEqual([provider2]);
      });

      it("should have onNewProvider event name prefixed for debugging purposes", () => {
        expect(
          providers.getByTag("foo-tag")._newProviderEventName.indexOf("new-provider-")
        ).toEqual(0);
      });

      it("should have provider id available when subscriber is executed", () => {
        const newProvidersTag1 = [];
        const newProvidersTag2 = [];
        providers.getByTag("foo-tag").onNewProvider((provider) => {
          newProvidersTag1.push(provider.id);
        });
        providers.getByTag("foo-tag2").onNewProvider((provider) => {
          newProvidersTag2.push(provider.id);
        });
        new Provider({ id: "foo", tags: ["foo-tag"] });
        new Provider({ id: "foo2", tags: ["foo-tag2"] });
        new Provider({ id: "foo3", tags: ["foo-tag"] });
        expect(newProvidersTag1).toEqual(["foo", "foo3"]);
        expect(newProvidersTag2).toEqual(["foo2"]);
      });
    });

    describe("when onNewProvider method is used in getById", () => {
      it("should execute callback each time a new provider is added", () => {
        const newProviders = [];
        providers.getById("foo").onNewProvider((provider) => {
          newProviders.push(provider);
        });
        const provider1 = new Provider({ id: "foo", tags: ["foo-tag"] });
        expect(newProviders).toEqual([provider1]);
      });

      it("should have provider id available when subscriber is executed", () => {
        const newProviders = [];
        providers.getById("foo").onNewProvider((provider) => {
          newProviders.push(provider.id);
        });
        new Provider({ id: "foo", tags: ["foo-tag"] });
        expect(newProviders).toEqual(["foo"]);
      });
    });
  });
});
