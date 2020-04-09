/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, Selector } = require("../../src/index");

describe("Selector query", () => {
  let sandbox;
  let provider;
  let selector;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new Provider();
    selector = new Selector(provider, () => {});
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("method", () => {
    it("should return a different selector instance", () => {
      const queried = selector.query({ foo: "foo" });
      expect(queried).not.toBe(selector);
    });

    it("should return same previously querid instance if query is equal", () => {
      const queried = selector.query({ foo: "foo" });
      const queried2 = selector.query({ foo: "foo" });
      expect(queried2).toBe(queried);
    });

    it("should return same selector instance if query is undefined", () => {
      const queried = selector.query();
      expect(queried).toBe(selector);
    });
  });

  describe("returned instance", () => {
    it("should be available at the childs property", () => {
      const queried = selector.query({ foo: "foo" });
      expect(selector.children.includes(queried)).toBe(true);
    });

    it("should return query value in the queryValue getter", () => {
      const queried = selector.query({ foo: "foo" });
      expect(queried.queryValue).toEqual({ foo: "foo" });
    });

    it("should not modify query value if original query object is modified", () => {
      const query = { foo: "foo" };
      const queried = selector.query(query);
      query.foo = "foo2";
      expect(queried.queryValue).toEqual({ foo: "foo" });
    });

    it("should return the parent element in the parent getter", () => {
      const queried = selector.query({ foo: "foo" });
      expect(queried.parent).toBe(selector);
    });

    it("should inherit query methods", () => {
      const byIdMethod = () => {};
      const byNameMethod = () => {};
      selector.addQuery("byId", byIdMethod);
      selector.addQuery("byName", byNameMethod);
      const queried = selector.query({ foo: "foo" });
      expect(queried.queryMethods.byId).toBe(selector.queryMethods.byId);
      expect(queried.queryMethods.byName).toBe(selector.queryMethods.byName);
    });

    it("should extend his own query with received one when queried again", () => {
      const queried = selector.query({ foo: "foo" });
      const queried2 = queried.query({ var: "var" });
      expect(queried2.queryValue).toEqual({ foo: "foo", var: "var" });
    });
  });

  describe("when adding query methods", () => {
    it("should be available at the queryMethods property", () => {
      const byIdMethod = () => {};
      selector.addQuery("byId", byIdMethod);
      expect(selector.queryMethods.byId).toBe(byIdMethod);
    });

    it("should apply the value returned by queryMethod as query", () => {
      const byIdMethod = (foo) => ({ foo });
      selector.addQuery("byId", byIdMethod);
      expect(selector.queries.byId("foo").queryValue).toEqual({ foo: "foo" });
    });

    it("should apply also the current query", () => {
      const byIdMethod = (foo) => ({ foo });
      selector.addQuery("byId", byIdMethod);
      const queried = selector.query({ var: "var" });
      expect(queried.queries.byId("foo").queryValue).toEqual({ var: "var", foo: "foo" });
    });
  });

  describe("used in selector function", () => {
    beforeEach(() => {
      selector = new Selector(provider, (providerResult, queryValue) => {
        return queryValue;
      });
    });

    it("should be available at the selector function as last argument", async () => {
      const QUERY = { foo: "foo" };
      const result = await selector.query(QUERY).read();
      expect(result).toEqual(QUERY);
    });
  });
});
