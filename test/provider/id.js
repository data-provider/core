/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("Provider id", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  it("should not return two equal ids is no specific id is provided", () => {
    expect.assertions(3);
    const provider = new Provider();
    const provider2 = new Provider();
    const provider3 = new Provider();
    expect(provider.id).not.toEqual(provider2.id);
    expect(provider2.id).not.toEqual(provider3.id);
    expect(provider3.id).not.toEqual(provider.id);
  });
});
