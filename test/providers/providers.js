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
      new Provider("foo-id");
      new Provider("foo-id");
      expect(console.warn.getCall(0).args[0]).toEqual(expect.stringContaining("foo-id"));
    });

    it("should not print a trace when providers has been clear", () => {
      new Provider("foo-id");
      providers.clear();
      new Provider("foo-id");
      expect(console.warn.callCount).toEqual(0);
    });
  });

  describe("elements getter", () => {
    it("should be empty if no providers have been created", () => {
      expect(providers.elements.length).toEqual(0);
    });

    it("should contain new created providers", () => {
      new Provider("foo-id");
      expect(providers.elements[0]._id).toEqual("foo-id");
    });

    it("should contain as much elements as providers have been created", () => {
      const fooOrigin = new Provider("foo-id");
      new Selector(fooOrigin, () => {}, {
        id: "foo-id-2"
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
      new Provider("foo");
      const origin = new Provider("foo-id");
      expect(providers.getById("foo-id").elements[0]).toEqual(origin);
    });

    it("should return only one element in elements property", () => {
      new Provider("foo");
      new Provider("foo-2");
      new Provider("foo-3");
      expect(providers.getById("foo").elements.length).toEqual(1);
    });

    it("should return only one element in elements property even when id is duplicated", () => {
      new Provider("foo");
      new Provider("foo-2");
      new Provider("foo-3");
      new Provider("foo");
      expect(providers.getById("foo").elements.length).toEqual(1);
    });

    it("should return only one element", () => {
      new Provider("foo");
      new Provider("foo-2");
      new Provider("foo-3");
      expect(providers.getById("foo").size).toEqual(1);
    });

    it("should not return an empty handler when id does not exist", () => {
      new Provider("foo");
      new Provider("foo-2");
      new Provider("foo-3");
      expect(providers.getById("foo-id").size).toEqual(0);
    });

    it("should return last element created when there is an id conflict", () => {
      new Provider("foo");
      new Provider("foo-id");
      const fooOrigin = new Provider("foo-id");
      expect(providers.getById("foo-id").elements[0]).toEqual(fooOrigin);
    });
  });

  describe("getByTag method", () => {
    describe("when filtering only by one tag", () => {
      it("should return handler containing providers with provided tag", () => {
        const TAG = "foo-tag-2";
        new Provider("foo", { tags: ["foo-tag"] });
        const origin = new Provider("foo-2", { tags: TAG });
        const origin2 = new Provider("foo-3", { tags: [TAG, "foo-tag-3"] });
        expect(providers.getByTag(TAG).size).toEqual(2);
        expect(providers.getByTag(TAG).elements[0]).toEqual(origin);
        expect(providers.getByTag(TAG).elements[1]).toEqual(origin2);
      });

      it("should return empty handler if no providers contain provided tag", () => {
        new Provider("foo", { tags: ["foo-tag"] });
        new Provider("foo-2", { tags: "foo-tag-2" });
        new Provider("foo-3", { tags: ["foo-tag-2", "foo-tag-3"] });
        expect(providers.getByTag("foo-unexistant-tag").size).toEqual(0);
      });
    });
  });
});
