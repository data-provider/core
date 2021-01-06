/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, SelectorV3 } = require("../../src/index");

describe("providers handler resetState method", () => {
  let sandbox;
  let fooProvider;
  let fooProvider2;
  let fooProvider3;
  let fooProvider4;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fooProvider = new Provider({ id: "foo-1", tags: "tag-1" });
    fooProvider2 = new Provider({ id: "foo-2", tags: ["tag-2", "tag-3"] });
    fooProvider3 = new Provider({ id: "foo-3", tags: "tag-3" });
    fooProvider4 = new SelectorV3(fooProvider, fooProvider2, () => {}, {
      id: "foo-4",
      tags: "tag-2",
    });

    sandbox.spy(fooProvider, "resetState");
    sandbox.spy(fooProvider2, "resetState");
    sandbox.spy(fooProvider3, "resetState");
    sandbox.spy(fooProvider4, "resetState");
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when applied to all providers", () => {
    it("should call to resetState method of all providers", () => {
      providers.resetState();

      expect(fooProvider.resetState.callCount).toEqual(1);
      expect(fooProvider2.resetState.callCount).toEqual(1);
      expect(fooProvider3.resetState.callCount).toEqual(1);
      expect(fooProvider4.resetState.callCount).toEqual(1);
    });
  });

  describe("when used with getById", () => {
    it("should call to resetState method only of selected providers", () => {
      providers.getById("foo-2").resetState();

      expect(fooProvider.resetState.callCount).toEqual(0);
      expect(fooProvider2.resetState.callCount).toEqual(1);
      expect(fooProvider3.resetState.callCount).toEqual(0);
      expect(fooProvider4.resetState.callCount).toEqual(0);
    });
  });

  describe("when used with getByTag", () => {
    it("should call to resetState method only of selected providers", () => {
      providers.getByTag("tag-2").resetState();

      expect(fooProvider.resetState.callCount).toEqual(0);
      expect(fooProvider2.resetState.callCount).toEqual(1);
      expect(fooProvider3.resetState.callCount).toEqual(0);
      expect(fooProvider4.resetState.callCount).toEqual(1);
    });

    it("should call to resetState method of all selected providers", () => {
      providers.getByTag("tag-3").resetState();

      expect(fooProvider.resetState.callCount).toEqual(0);
      expect(fooProvider2.resetState.callCount).toEqual(1);
      expect(fooProvider3.resetState.callCount).toEqual(1);
      expect(fooProvider4.resetState.callCount).toEqual(0);
    });
  });
});
