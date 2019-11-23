/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { sources } = require("@data-provider/core");

const { Api, apis } = require("../src/index");

const TAG = "api";

describe("sources clean method", () => {
  let sandbox;
  let api_1;
  let api_2;
  let api_3;
  let allApiSources;

  beforeAll(() => {
    allApiSources = sources.getByTag(TAG);
    apis.reset();
    api_1 = new Api("foo-1");
    api_2 = new Api("foo-2", {
      tags: "tag-1"
    });
    api_3 = new Api("foo-3", {
      tags: ["tag-1", "tag-2"]
    });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    api_1.clean = sandbox.spy();
    api_2.clean = sandbox.spy();
    api_3.clean = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(() => {
    allApiSources.clear();
  });

  describe("when calling apis clean method", () => {
    describe("if no tags are defined", () => {
      it("should clean all existant apis", () => {
        allApiSources.clean();
        expect(api_1.clean.called).toEqual(true);
        expect(api_2.clean.called).toEqual(true);
        expect(api_3.clean.called).toEqual(true);
      });
    });

    describe("if tag is defined as string", () => {
      it("should clean all existant apis having a tag matching with it", () => {
        sources.getByTag("tag-1").clean();
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(true);
        expect(api_3.clean.called).toEqual(true);
      });

      it("should not clean any api if any have a matching tag", () => {
        sources.getByTag("tag-foo").clean();
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(false);
        expect(api_3.clean.called).toEqual(false);
      });
    });

    describe("if tag is an array", () => {
      it("should clean all existant apis having a tag matching with any of it", () => {
        sources.getByTag("tag-1").clean();
        sources.getByTag("foo").clean();
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(true);
        expect(api_3.clean.called).toEqual(true);
      });

      it("should not clean any api if any have a matching tag", () => {
        sources.getByTag("tag-foo").clean();
        sources.getByTag("foo").clean();
        expect(api_1.clean.called).toEqual(false);
        expect(api_2.clean.called).toEqual(false);
        expect(api_3.clean.called).toEqual(false);
      });
    });
  });
});
