/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const index = require("../src/index");

describe("index", () => {
  it("should export Provider", () => {
    expect(index.Provider).toBeDefined();
  });

  it("should export Selector", () => {
    expect(index.Selector).toBeDefined();
  });

  it("should export SelectorV3", () => {
    expect(index.SelectorV3).toBeDefined();
  });

  it("should export providers", () => {
    expect(index.providers).toBeDefined();
  });

  it("should export storeManager", () => {
    expect(index.storeManager).toBeDefined();
  });

  it("should export eventNames", () => {
    expect(index.eventNames.INIT).toBeDefined();
    expect(index.eventNames.CLEAN_CACHE).toBeDefined();
    expect(index.eventNames.RESET_STATE).toBeDefined();
    expect(index.eventNames.READ_START).toBeDefined();
    expect(index.eventNames.READ_SUCCESS).toBeDefined();
    expect(index.eventNames.READ_ERROR).toBeDefined();
    expect(index.eventNames.ANY).toBeDefined();
  });

  it("should export providerArgsV3 method", () => {
    expect(index.providerArgsV3).toBeDefined();
  });
});
