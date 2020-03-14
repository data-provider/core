/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, Selector, providers } = require("../../src/index");

describe("Selector id", () => {
  let sandbox;
  let provider;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new Provider();
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  it("should not return two equal ids is no specific id is provided", () => {
    expect.assertions(3);
    const selector = new Selector(provider, () => {});
    const selector2 = new Selector(provider, () => {});
    const selector3 = new Selector(provider, () => {});
    expect(selector.id).not.toEqual(selector2.id);
    expect(selector2.id).not.toEqual(selector3.id);
    expect(selector3.id).not.toEqual(selector.id);
  });

  it("should be provided id", () => {
    const selector = new Selector(provider, () => {}, {
      id: "foo-id"
    });
    expect(selector.id).toEqual("foo-id");
  });

  it("should be provided id adding query id", () => {
    const selector = new Selector(provider, () => {}, {
      id: "foo-id"
    });
    expect(selector.query({ foo: "foo" }).id).toEqual('foo-id({"foo":"foo"})');
  });

  it("should be provided id adding all childs query ids", () => {
    const selector = new Selector(provider, () => {}, {
      id: "foo-id"
    });
    expect(selector.query({ foo: "foo" }).query({ var: "var" }).id).toEqual(
      'foo-id({"foo":"foo"})({"foo":"foo","var":"var"})'
    );
  });
});
