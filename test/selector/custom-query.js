/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const { Provider, providers, Selector } = require("../../src/index");

describe("Selector with custom query", () => {
  let sandbox;
  let provider;
  let selector;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new Provider();
    selector = new Selector(provider, () => {}, {
      getChildQueryMethod: (newQuery, currentQuery) => {
        return {
          queryString: {
            ...currentQuery.queryString,
            ...newQuery.queryString,
          },
          urlParams: {
            ...currentQuery.urlParams,
            ...newQuery.urlParams,
          },
        };
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
    providers.clear();
  });

  describe("when queried recursively", () => {
    it("should extend its own query with received one using the custom method when queried again", () => {
      const queried = selector.query({ queryString: { foo: "foo" } });
      const queried2 = queried.query({ queryString: { var: "var" } });
      expect(queried2.queryValue).toEqual({
        queryString: { foo: "foo", var: "var" },
        urlParams: {},
      });
    });

    it("should extend its own query with received one using the custom method when queried three times", () => {
      const queried = selector.query({ queryString: { foo: "foo" } });
      const queried2 = queried.query({ queryString: { var: "var" } });
      const queried3 = queried2.query({ urlParams: { var2: "var2" } });
      expect(queried3.queryValue).toEqual({
        queryString: { foo: "foo", var: "var" },
        urlParams: { var2: "var2" },
      });
    });
  });
});
