/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("Provider read method", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when no readMethod is defined", () => {
    it("should resolve data state", async () => {
      const provider = new Provider("foo-id", {
        initialState: {
          data: "foo",
        },
      });
      const data = await provider.read();
      expect(data).toEqual("foo");
    });
  });

  describe("when readMethod is defined", () => {
    let TestProvider;
    let spies;
    let provider;
    let results;

    beforeEach(() => {
      spies = {
        read: sinon.spy(),
      };

      results = {
        throwError: null,
        returnData: null,
      };

      TestProvider = class extends Provider {
        readMethod() {
          const args = Array.from(arguments);
          spies.read.apply(this, args);
          if (results.throwError) {
            throw results.throwError;
          }
          return results.returnData;
        }
      };

      provider = new TestProvider();
    });

    it("should resolve the result returned by readMethod when does not returns a Promise", async () => {
      results.returnData = "foo-data";
      const data = await provider.read();
      expect(data).toEqual("foo-data");
    });

    it("should be called when same arguments than the read method", async () => {
      results.returnData = "foo-data";
      await provider.read("foo", "foo1", "foo2");
      expect(spies.read.getCall(0).args).toEqual(["foo", "foo1", "foo2"]);
    });

    it("should resolve the result returned by readMethod when returns a Promise", async () => {
      results.returnData = Promise.resolve("foo-data");
      const data = await provider.read();
      expect(data).toEqual("foo-data");
    });

    it("should reject the error thrown by readMethod", async () => {
      expect.assertions(1);
      const error = new Error("Foo error");
      results.throwError = new Error("Foo error");
      try {
        await provider.read();
      } catch (err) {
        expect(err).toEqual(error);
      }
    });

    it("should reject the error thrown by readMethod when returns a rejected promise", async () => {
      expect.assertions(1);
      const error = new Error("Foo error");
      results.returnData = Promise.reject(error);
      try {
        await provider.read();
      } catch (err) {
        expect(err).toEqual(error);
      }
    });
  });
});
