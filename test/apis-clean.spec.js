/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

const TAG = "axios";

describe("providers clean method", () => {
  let sandbox;
  let api_1;
  let api_2;
  let api_3;
  let allAxiosSources;

  beforeAll(() => {
    providers.clear();
    allAxiosSources = providers.getByTag(TAG);
    api_1 = new Axios("foo-1");
    api_2 = new Axios("foo-2", {
      tags: ["tag-1"]
    });
    api_3 = new Axios("foo-3", {
      tags: ["tag-1", "tag-2"]
    });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    api_1.cleanCache = sandbox.spy();
    api_2.cleanCache = sandbox.spy();
    api_3.cleanCache = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(() => {
    allAxiosSources.clear();
  });

  describe("when calling apis clean method", () => {
    describe("if no tags are defined", () => {
      it("should clean all existant apis", () => {
        allAxiosSources.cleanCache();
        expect(api_1.cleanCache.called).toEqual(true);
        expect(api_2.cleanCache.called).toEqual(true);
        expect(api_3.cleanCache.called).toEqual(true);
      });
    });

    describe("if tag is defined as string", () => {
      it("should clean all existant apis having a tag matching with it", () => {
        providers.getByTag("tag-1").cleanCache();
        expect(api_1.cleanCache.called).toEqual(false);
        expect(api_2.cleanCache.called).toEqual(true);
        expect(api_3.cleanCache.called).toEqual(true);
      });

      it("should not clean any api if any have a matching tag", () => {
        providers.getByTag("tag-foo").cleanCache();
        expect(api_1.cleanCache.called).toEqual(false);
        expect(api_2.cleanCache.called).toEqual(false);
        expect(api_3.cleanCache.called).toEqual(false);
      });
    });

    describe("if tag is an array", () => {
      it("should clean all existant apis having a tag matching with any of it", () => {
        providers.getByTag("tag-1").cleanCache();
        providers.getByTag("foo").cleanCache();
        expect(api_1.cleanCache.called).toEqual(false);
        expect(api_2.cleanCache.called).toEqual(true);
        expect(api_3.cleanCache.called).toEqual(true);
      });

      it("should not clean any api if any have a matching tag", () => {
        providers.getByTag("tag-foo").cleanCache();
        providers.getByTag("foo").cleanCache();
        expect(api_1.cleanCache.called).toEqual(false);
        expect(api_2.cleanCache.called).toEqual(false);
        expect(api_3.cleanCache.called).toEqual(false);
      });
    });
  });
});
