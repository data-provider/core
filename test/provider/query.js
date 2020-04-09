/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers } = require("../../src/index");

describe("Provider query", () => {
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

  describe("method", () => {
    it("should return a different provider instance", () => {
      const queried = provider.query({ foo: "foo" });
      expect(queried).not.toBe(provider);
    });

    it("should return same previously querid instance if query is equal", () => {
      const queried = provider.query({ foo: "foo" });
      const queried2 = provider.query({ foo: "foo" });
      expect(queried2).toBe(queried);
    });

    it("should return same provider instance if query is undefined", () => {
      const queried = provider.query();
      expect(queried).toBe(provider);
    });
  });

  describe("returned instance", () => {
    it("should be available at the childs property", () => {
      const queried = provider.query({ foo: "foo" });
      expect(provider.children.includes(queried)).toBe(true);
    });

    it("should return query value in the queryValue getter", () => {
      const queried = provider.query({ foo: "foo" });
      expect(queried.queryValue).toEqual({ foo: "foo" });
    });

    it("should not modify query value if original query object is modified", () => {
      const query = { foo: "foo" };
      const queried = provider.query(query);
      query.foo = "foo2";
      expect(queried.queryValue).toEqual({ foo: "foo" });
    });

    it("should return the parent element in the parent getter", () => {
      const queried = provider.query({ foo: "foo" });
      expect(queried.parent).toBe(provider);
    });

    it("should inherit query methods", () => {
      const byIdMethod = () => {};
      const byNameMethod = () => {};
      provider.addQuery("byId", byIdMethod);
      provider.addQuery("byName", byNameMethod);
      const queried = provider.query({ foo: "foo" });
      expect(queried.queryMethods.byId).toBe(provider.queryMethods.byId);
      expect(queried.queryMethods.byName).toBe(provider.queryMethods.byName);
    });

    it("should extend his own query with received one when queried again", () => {
      const queried = provider.query({ foo: "foo" });
      const queried2 = queried.query({ var: "var" });
      expect(queried2.queryValue).toEqual({ foo: "foo", var: "var" });
    });
  });

  describe("when adding query methods", () => {
    it("should be available at the queryMethods property", () => {
      const byIdMethod = () => {};
      provider.addQuery("byId", byIdMethod);
      expect(provider.queryMethods.byId).toBe(byIdMethod);
    });

    it("should apply the value returned by queryMethod as query", () => {
      const byIdMethod = (foo) => ({ foo });
      provider.addQuery("byId", byIdMethod);
      expect(provider.queries.byId("foo").queryValue).toEqual({ foo: "foo" });
    });

    it("should apply also the current query", () => {
      const byIdMethod = (foo) => ({ foo });
      provider.addQuery("byId", byIdMethod);
      const queried = provider.query({ var: "var" });
      expect(queried.queries.byId("foo").queryValue).toEqual({ var: "var", foo: "foo" });
    });
  });

  describe("when provider implementation defines his own getChildQueryMethod", () => {
    beforeEach(() => {
      class CustomProvider extends Provider {
        getChildQueryMethod(query) {
          return {
            ...this.queryValue,
            ...query,
            foo: {
              ...this.queryValue.foo,
              ...query.foo,
            },
          };
        }
      }
      provider = new CustomProvider();
    });

    it("should use defined method to calculate child query", () => {
      const byIdMethod = (foo) => ({ foo });
      provider.addQuery("byId", byIdMethod);
      expect(
        provider.queries
          .byId({
            var: "var",
          })
          .queries.byId({
            var2: "var2",
          }).queryValue
      ).toEqual({ foo: { var: "var", var2: "var2" } });
    });
  });
});
