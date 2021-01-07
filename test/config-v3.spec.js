/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const AxiosMock = require("./Axios.mock.js");

const { providers } = require("@data-provider/core");
const { Axios } = require("../src/index");

describe("Axios configuration", () => {
  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
    providers.clear();
  });

  afterAll(() => {
    providers.clear();
  });

  beforeEach(() => {
    axios.stubs.instance.resolves({
      data: "foo",
    });
    axios.stubs.instance.resetHistory();
  });

  describe("baseUrl option", () => {
    it("should set the base url for axios requests", async () => {
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
        baseUrl: "http://localhost:3000",
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("http://localhost:3000/books");
    });

    it("should work with config method", async () => {
      expect.assertions(2);
      const books = new Axios({
        url: "/books",
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/books");
      books.cleanCache();
      books.config({
        baseUrl: "http://localhost:3000",
      });
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].url).toEqual("http://localhost:3000/books");
    });
  });

  describe("readVerb option", () => {
    it("should set the read method for axios requests", async () => {
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
        readVerb: "post",
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("post");
    });

    it("should work with config method", async () => {
      expect.assertions(2);
      const books = new Axios({
        url: "/books",
      });
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("get");
      books.cleanCache();
      books.config({
        readVerb: "post",
      });
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].method).toEqual("post");
    });
  });

  describe("updateVerb option", () => {
    it("should set the update method for axios requests", async () => {
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
        updateVerb: "get",
      });
      await books.update();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("get");
    });

    it("should work with config method", async () => {
      expect.assertions(2);
      const books = new Axios({
        url: "/books",
      });
      await books.update();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("patch");
      books.config({
        updateVerb: "post",
      });
      await books.update();
      expect(axios.stubs.instance.getCall(1).args[0].method).toEqual("post");
    });
  });

  describe("createVerb option", () => {
    it("should set the create method for axios requests", async () => {
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
        createVerb: "get",
      });
      await books.create();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("get");
    });

    it("should work with config method", async () => {
      expect.assertions(2);
      const books = new Axios({
        url: "/books",
      });
      await books.create();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("post");
      books.config({
        createVerb: "put",
      });
      await books.create();
      expect(axios.stubs.instance.getCall(1).args[0].method).toEqual("put");
    });
  });

  describe("deleteVerb option", () => {
    it("should set the delete method for axios requests", async () => {
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
        deleteVerb: "get",
      });
      await books.delete();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("get");
    });

    it("should work with config method", async () => {
      expect.assertions(2);
      const books = new Axios({
        url: "/books",
        deleteVerb: "delete",
      });
      await books.delete();
      expect(axios.stubs.instance.getCall(0).args[0].method).toEqual("delete");
      books.config({
        deleteVerb: "put",
      });
      await books.delete();
      expect(axios.stubs.instance.getCall(1).args[0].method).toEqual("put");
    });
  });

  describe("authErrorStatus option", () => {
    it("should set the status considered as an authentication error in axios responses", async () => {
      expect.assertions(1);
      const error = new Error();
      let authError = false;
      error.response = {
        status: 1240,
      };
      axios.stubs.instance.rejects(error);
      const books = new Axios({
        url: "/books",
        authErrorStatus: 1240,
        authErrorHandler: () => {
          authError = true;
          return Promise.reject(error);
        },
      });
      try {
        await books.read();
      } catch (err) {
        expect(authError).toEqual(true);
      }
    });
  });

  describe("authErrorHandler option", () => {
    it("should retry the request once if executes the retry argument, setting headers again", async () => {
      expect.assertions(2);
      const error = new Error();
      error.response = {
        status: 401,
      };
      axios.stubs.instance.rejects(error);
      const books = new Axios({
        url: "/books",
        authErrorHandler: (dataSource, retry) => {
          dataSource.setHeaders({
            foo: "foo",
          });
          return retry();
        },
      });
      try {
        await books.read();
      } catch (err) {
        expect(axios.stubs.instance.callCount).toEqual(2);
        expect(axios.stubs.instance.getCall(1).args[0].headers).toEqual({
          foo: "foo",
        });
      }
    });
  });

  describe("onBeforeRequest option", () => {
    it("should be executed before all requests are made", async () => {
      expect.assertions(4);
      let dataSource;
      const stub = sinon.stub().callsFake((source) => {
        source.config({
          baseUrl: "/foo-base-url",
        });
        dataSource = source;
      });

      const books = new Axios({
        url: "/books",
        onBeforeRequest: stub,
      });
      await books.read();
      await books.create();
      expect(dataSource).toEqual(books);
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/foo-base-url/books");
      expect(axios.stubs.instance.getCall(1).args[0].url).toEqual("/foo-base-url/books");
      expect(stub.callCount).toEqual(2);
    });
  });

  describe("onceBeforeRequest option", () => {
    it("should be executed before first requests is made", async () => {
      expect.assertions(5);
      let dataSource;
      const stub = sinon.stub().callsFake((source) => {
        source.config({
          baseUrl: "/foo-base-url",
        });
        dataSource = source;
      });

      const books = new Axios({
        url: "/books",
        onceBeforeRequest: stub,
      });
      await books.read();
      await books.create();
      await books.read();
      expect(dataSource).toEqual(books);
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/foo-base-url/books");
      expect(axios.stubs.instance.getCall(1).args[0].url).toEqual("/foo-base-url/books");
      expect(axios.stubs.instance.getCall(2).args[0].url).toEqual("/foo-base-url/books");
      expect(stub.callCount).toEqual(1);
    });

    it("should be executed before first requests is made each time it is redefined", async () => {
      expect.assertions(5);
      let dataSource;
      const stub = sinon.stub();

      const books = new Axios({
        url: "/books",
        baseUrl: "/foo-base-url",
        onceBeforeRequest: (source) => {
          dataSource = source;
          stub();
        },
      });
      await books.read();
      books.config({
        onceBeforeRequest: (source) => {
          dataSource = source;
          stub();
        },
      });
      await books.create();
      books.config({
        onceBeforeRequest: (source) => {
          dataSource = source;
          stub();
        },
      });
      await books.read();
      expect(dataSource).toEqual(books);
      expect(axios.stubs.instance.getCall(0).args[0].url).toEqual("/foo-base-url/books");
      expect(axios.stubs.instance.getCall(1).args[0].url).toEqual("/foo-base-url/books");
      expect(axios.stubs.instance.getCall(2).args[0].url).toEqual("/foo-base-url/books");
      expect(stub.callCount).toEqual(3);
    });
  });

  describe("expirationTime option", () => {
    let books;

    beforeAll(() => {
      books = new Axios({
        url: "/books",
        expirationTime: 100,
      });
    });

    afterAll(() => {
      books.config({
        expirationTime: 0,
      });
    });

    it("should clean the cache at defined intervals", async () => {
      expect.assertions(1);
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          books.read();
        }, 150);

        setTimeout(() => {
          clearInterval(interval);
          expect(axios.stubs.instance.callCount > 3).toEqual(true);
          resolve();
        }, 1000);
      });
    });

    it("should set the interval again when using config method", async () => {
      expect.assertions(1);
      books.config({
        expirationTime: 0,
      });
      books.cleanCache();
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          books.read();
        }, 150);

        setTimeout(() => {
          clearInterval(interval);
          expect(axios.stubs.instance.callCount).toEqual(1);
          resolve();
        }, 1000);
      });
    });
  });

  describe("cache option", () => {
    it("should do requests always if it is false", async () => {
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
        cache: false,
      });
      await books.read();
      await books.read();
      await books.read();
      expect(axios.stubs.instance.callCount).toEqual(3);
    });
  });

  describe("fullResponse option", () => {
    const axiosResponse = {
      data: "foo",
      headers: {
        foo: "foo",
      },
    };

    it("should set value with full axios response when true", async () => {
      axios.stubs.instance.resolves(axiosResponse);
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
        fullResponse: true,
      });
      await books.read();
      expect(books.state.data).toEqual(axiosResponse);
    });

    it("should set value with axios data when false", async () => {
      axios.stubs.instance.resolves(axiosResponse);
      expect.assertions(1);
      const books = new Axios({
        url: "/books",
      });
      await books.read();
      expect(books.state.data).toEqual(axiosResponse.data);
    });
  });

  describe("validateStatus option", () => {
    it("should be used as axios validateStatus callback", async () => {
      expect.assertions(2);
      const validateStatus = (status) => status !== 200;
      const books = new Axios({
        url: "/books",
        validateStatus,
      });
      await books.read();
      expect(books._validateStatus(200)).toEqual(false);
      expect(axios.stubs.instance.getCall(0).args[0].validateStatus).toBe(validateStatus);
    });

    it("should consider error responses with status lower than 200 by default", () => {
      const books = new Axios({
        url: "/books",
      });
      expect(books._validateStatus(140)).toEqual(false);
    });

    it("should consider error responses with status upper than 300 by default", () => {
      const books = new Axios({
        url: "/books",
      });
      expect(books._validateStatus(320)).toEqual(false);
    });

    it("should consider valid responses with status between 200 and 300", () => {
      const books = new Axios({
        url: "/books",
      });
      expect(books._validateStatus(200)).toEqual(true);
    });
  });

  describe("validateResponse option", () => {
    it("should reject with an error if response does not pass validation", async () => {
      expect.assertions(1);
      const fooErrorMessage = "foo";
      const fooError = new Error(fooErrorMessage);
      const books = new Axios({
        url: "/books",
        validateResponse: () => {
          return Promise.reject(fooError);
        },
      });
      try {
        await books.read();
      } catch (err) {
        expect(books.state.error.message).toBe(fooErrorMessage);
      }
    });

    it("should resolve if response pass validation", async () => {
      expect.assertions(1);
      let called;
      const books = new Axios({
        url: "/books",
        validateResponse: () => {
          called = true;
          return Promise.resolve();
        },
      });
      await books.read();
      expect(called).toBe(true);
    });
  });

  describe("errorHandler option", () => {
    it("should parse received errors before setting error property", async () => {
      expect.assertions(2);
      const error = new Error();
      const newError = new Error("Foo new error");
      error.response = {
        status: 401,
      };
      axios.stubs.instance.rejects(error);
      const books = new Axios({
        url: "/books",
        errorHandler: (err) => {
          expect(err).toBe(error);
          return Promise.reject(newError);
        },
      });
      try {
        await books.read();
      } catch (err) {
        expect(books.state.error).toBe(newError);
      }
    });

    it("should return an error with response statusText by default", async () => {
      expect.assertions(1);
      const error = new Error("Foo error");
      error.response = {
        statusText: "Foo new error",
      };
      axios.stubs.instance.rejects(error);
      const books = new Axios({
        url: "/books",
      });
      try {
        await books.read();
      } catch (err) {
        expect(books.state.error.message).toEqual("Foo new error");
      }
    });

    it("should return error data attached as an error property", async () => {
      expect.assertions(1);
      const error = new Error("Foo error");
      error.response = {
        statusText: "Foo new error",
        data: {
          status: 401,
        },
      };
      axios.stubs.instance.rejects(error);
      const books = new Axios({
        url: "/books",
      });
      try {
        await books.read();
      } catch (err) {
        expect(books.state.error.data).toEqual({
          status: 401,
        });
      }
    });

    it("should return an error with error message if no response statusText is defined by default", async () => {
      expect.assertions(1);
      const error = new Error("Foo error");
      axios.stubs.instance.rejects(error);
      const books = new Axios({
        url: "/books",
      });
      try {
        await books.read();
      } catch (err) {
        expect(books.state.error.message).toEqual("Foo error");
      }
    });

    it('should return an error with "Request error" as message if no error message and no response statusText are defined by default', async () => {
      expect.assertions(1);
      const error = new Error();
      axios.stubs.instance.rejects(error);
      const books = new Axios({
        url: "/books",
      });
      try {
        await books.read();
      } catch (err) {
        expect(books.state.error.message).toEqual("Request error");
      }
    });
  });
});
