/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { createStore, combineReducers } = require("redux");

const { Provider, providers, storeManager } = require("../src/index");

describe("storeManager", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    new Provider("foo", {
      initialState: {
        data: "foo-data"
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.resetState();
    providers.clear();
  });

  describe("without migrate", () => {
    it("should store state in own store, available through storeManager", async () => {
      expect(storeManager.state.foo.state.data).toEqual("foo-data");
    });
  });

  describe("after migrate", () => {
    it("should store state in new store", async () => {
      const store = createStore(
        combineReducers({
          newNamespace: storeManager.reducer
        })
      );

      storeManager.setStore(store, "newNamespace");

      expect(storeManager.namespace).toEqual("newNamespace");
      expect(storeManager.state.foo.state.data).toEqual("foo-data");
      expect(store.getState().newNamespace.foo.state.data).toEqual("foo-data");
    });
  });
});
