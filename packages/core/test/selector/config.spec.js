/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");
const { defaultOptions } = require("../../src/helpers");

describe("Selector config", () => {
  let sandbox;
  let provider;

  beforeEach(() => {
    provider = new Provider({ id: "foo-id" });
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  it("should have default options by default", () => {
    const selector = new Selector(provider, () => {});

    expect(selector.options).toEqual({
      ...defaultOptions,
    });
  });

  it("should define cache option if received", () => {
    const selector = new Selector(provider, () => {}, {
      cache: false,
    });

    expect(selector.options).toEqual({
      ...defaultOptions,
      cache: false,
    });
  });

  it("should define reReadDependenciesMaxTime option if received", () => {
    const selector = new Selector(provider, () => {}, {
      readAgainMaxTime: 7000,
    });

    expect(selector.options).toEqual({
      ...defaultOptions,
      readAgainMaxTime: 7000,
    });
  });

  it("method should extend current options", () => {
    const selector = new Selector(provider, () => {}, {
      option1: "foo",
      option2: "foo2",
    });

    selector.config({
      option2: "foo-2",
      option3: "foo3",
      cache: true,
      readAgainMaxTime: 2000,
    });

    expect(selector.options).toEqual({
      ...defaultOptions,
      option1: "foo",
      option2: "foo-2",
      option3: "foo3",
      cache: true,
      readAgainMaxTime: 2000,
    });
  });
});
