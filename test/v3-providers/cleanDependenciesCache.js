/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, SelectorV3 } = require("../../src/index");

describe("providers handler cleanDependenciesCache method", () => {
  let sandbox;
  let fooProvider;
  let fooProvider2;
  let fooProvider3;
  let fooProvider4;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fooProvider = new Provider("foo-1", { tags: "tag-1" });
    fooProvider2 = new Provider("foo-2", { tags: ["tag-2", "tag-3"] });
    fooProvider3 = new Provider("foo-3", { tags: "tag-3" });
    fooProvider4 = new SelectorV3(fooProvider, fooProvider2, () => {}, {
      id: "foo-4",
      tags: "tag-2",
    });

    sandbox.spy(fooProvider, "cleanDependenciesCache");
    sandbox.spy(fooProvider2, "cleanDependenciesCache");
    sandbox.spy(fooProvider3, "cleanDependenciesCache");
    sandbox.spy(fooProvider4, "cleanDependenciesCache");
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when applied to all providers", () => {
    it("should call to cleanDependenciesCache method of all providers", () => {
      providers.cleanDependenciesCache();

      expect(fooProvider.cleanDependenciesCache.callCount).toEqual(1);
      expect(fooProvider2.cleanDependenciesCache.callCount).toEqual(1);
      expect(fooProvider3.cleanDependenciesCache.callCount).toEqual(1);
      expect(fooProvider4.cleanDependenciesCache.callCount).toEqual(1);
    });

    it("should pass options to providers cleanDependenciesCache method", () => {
      providers.cleanDependenciesCache({ force: true });

      expect(fooProvider.cleanDependenciesCache.getCall(0).args[0]).toEqual({ force: true });
      expect(fooProvider2.cleanDependenciesCache.getCall(0).args[0]).toEqual({ force: true });
      expect(fooProvider3.cleanDependenciesCache.getCall(0).args[0]).toEqual({ force: true });
      expect(fooProvider4.cleanDependenciesCache.getCall(0).args[0]).toEqual({ force: true });
    });
  });

  describe("when used with getById", () => {
    it("should call to cleanDependenciesCache method only of selected providers", () => {
      providers.getById("foo-2").cleanDependenciesCache();

      expect(fooProvider.cleanDependenciesCache.callCount).toEqual(0);
      expect(fooProvider2.cleanDependenciesCache.callCount).toEqual(1);
      expect(fooProvider3.cleanDependenciesCache.callCount).toEqual(0);
      expect(fooProvider4.cleanDependenciesCache.callCount).toEqual(0);
    });
  });

  describe("when used with getByTag", () => {
    it("should call to cleanDependenciesCache method only of selected providers", () => {
      providers.getByTag("tag-2").cleanDependenciesCache();

      expect(fooProvider.cleanDependenciesCache.callCount).toEqual(0);
      expect(fooProvider2.cleanDependenciesCache.callCount).toEqual(1);
      expect(fooProvider3.cleanDependenciesCache.callCount).toEqual(0);
      expect(fooProvider4.cleanDependenciesCache.callCount).toEqual(1);
    });

    it("should call to cleanDependenciesCache method of all selected providers", () => {
      providers.getByTag("tag-3").cleanDependenciesCache();

      expect(fooProvider.cleanDependenciesCache.callCount).toEqual(0);
      expect(fooProvider2.cleanDependenciesCache.callCount).toEqual(1);
      expect(fooProvider3.cleanDependenciesCache.callCount).toEqual(1);
      expect(fooProvider4.cleanDependenciesCache.callCount).toEqual(0);
    });
  });
});
