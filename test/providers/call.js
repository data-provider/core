/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, Selector } = require("../../src/index");

describe("providers handler call method", () => {
  const FooProvider = class extends Provider {
    fooMethod() {
      return this.id;
    }
  };
  let sandbox;
  let fooProvider;
  let fooProvider2;
  let fooProvider3;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fooProvider = new FooProvider("foo-1", { tags: "tag-1" });
    fooProvider2 = new FooProvider("foo-2", { tags: ["tag-2", "tag-3"] });
    fooProvider3 = new FooProvider("foo-3", { tags: "tag-3" });
    new Selector(fooProvider, fooProvider2, () => {}, {
      id: "foo-4",
      tags: "tag-2",
    });

    sandbox.spy(fooProvider, "fooMethod");
    sandbox.spy(fooProvider2, "fooMethod");
    sandbox.spy(fooProvider3, "fooMethod");
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when applied to all providers", () => {
    it("should call to defined method of all providers", () => {
      providers.call("fooMethod");

      expect(fooProvider.fooMethod.callCount).toEqual(1);
      expect(fooProvider2.fooMethod.callCount).toEqual(1);
      expect(fooProvider3.fooMethod.callCount).toEqual(1);
    });

    it("should apply passed arguments to providers methods", () => {
      providers.call("fooMethod", "foo", "foo2", "foo3");

      expect(fooProvider.fooMethod.getCall(0).args).toEqual(["foo", "foo2", "foo3"]);
      expect(fooProvider2.fooMethod.getCall(0).args).toEqual(["foo", "foo2", "foo3"]);
      expect(fooProvider3.fooMethod.getCall(0).args).toEqual(["foo", "foo2", "foo3"]);
    });

    it("should return an array containing results of all providers", () => {
      expect(providers.call("fooMethod")).toEqual(["foo-1", "foo-2", "foo-3", undefined]);
    });
  });

  describe("when method does not exist in provider", () => {
    beforeEach(() => {
      sandbox.stub(console, "warn");
    });

    it("should print a trace with the provider id", () => {
      providers.call("fooMethod");
      expect(console.warn.getCall(0).args[0]).toEqual(expect.stringContaining("foo-4"));
    });
  });

  describe("when used with getById", () => {
    it("should call to defined method only of selected providers", () => {
      providers.getById("foo-2").call("fooMethod");

      expect(fooProvider.fooMethod.callCount).toEqual(0);
      expect(fooProvider2.fooMethod.callCount).toEqual(1);
      expect(fooProvider3.fooMethod.callCount).toEqual(0);
    });

    it("should apply passed arguments to providers methods", () => {
      providers.getById("foo-2").call("fooMethod", "foo", "foo2", "foo3");

      expect(fooProvider2.fooMethod.getCall(0).args).toEqual(["foo", "foo2", "foo3"]);
    });

    it("should return an array containing the result of the method of selected provider", () => {
      expect(providers.getById("foo-2").call("fooMethod")).toEqual(["foo-2"]);
    });

    it("should return undefined if method does not exist in selected provider", () => {
      expect(providers.getById("foo-4").call("fooMethod")).toEqual([undefined]);
    });
  });

  describe("when used with getByTag", () => {
    it("should call to defined method only of selected providers", () => {
      providers.getByTag("tag-2").call("fooMethod");

      expect(fooProvider.fooMethod.callCount).toEqual(0);
      expect(fooProvider2.fooMethod.callCount).toEqual(1);
      expect(fooProvider3.fooMethod.callCount).toEqual(0);
    });

    it("should apply passed arguments to providers methods", () => {
      providers.getByTag("tag-2").call("fooMethod", "foo", "foo2", "foo3");

      expect(fooProvider2.fooMethod.getCall(0).args).toEqual(["foo", "foo2", "foo3"]);
    });

    it("should apply passed arguments to all providers methods", () => {
      providers.getByTag("tag-3").call("fooMethod", "foo", "foo2", "foo3");

      expect(fooProvider2.fooMethod.getCall(0).args).toEqual(["foo", "foo2", "foo3"]);
      expect(fooProvider3.fooMethod.getCall(0).args).toEqual(["foo", "foo2", "foo3"]);
    });

    it("should not call to providers not tagged with provided tag", () => {
      providers.getByTag("tag-3").call("fooMethod", "foo", "foo2", "foo3");

      expect(fooProvider.fooMethod.callCount).toEqual(0);
    });

    it("should return an array containing results of selected providers", () => {
      expect(providers.getByTag("tag-3").call("fooMethod")).toEqual(["foo-2", "foo-3"]);
    });
  });
});
