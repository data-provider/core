/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");
const { defaultOptions } = require("../../src/helpers");

describe("Provider config", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  it("should have default options by default", () => {
    const provider = new Provider({ id: "foo-id" });

    expect(provider.options).toEqual({
      ...defaultOptions,
      id: "foo-id",
    });
  });

  it("should define cache option if received", () => {
    const provider = new Provider({
      id: "foo-id",
      cache: false,
    });

    expect(provider.options).toEqual({
      ...defaultOptions,
      cache: false,
      id: "foo-id",
    });
  });

  it("should be created from options", () => {
    const provider = new Provider({
      id: "foo-id",
      option1: "foo",
      option2: "foo2",
    });

    expect(provider.options).toEqual({
      ...defaultOptions,
      option1: "foo",
      option2: "foo2",
      id: "foo-id",
    });
  });

  it("method should extend current options", () => {
    const provider = new Provider({
      id: "foo-id",
      option1: "foo",
      option2: "foo2",
    });

    provider.config({
      option2: "foo-2",
      option3: "foo3",
    });

    expect(provider.options).toEqual({
      ...defaultOptions,
      option1: "foo",
      option2: "foo-2",
      option3: "foo3",
      id: "foo-id",
    });
  });
});
