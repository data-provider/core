const AxiosMock = require("./Axios.mock.js");

const { Api } = require("../src/index");

describe("Api configuration", () => {
  let axios;

  beforeAll(() => {
    axios = new AxiosMock();
  });

  afterAll(() => {
    axios.restore();
  });

  beforeEach(() => {
    axios.stubs.instance.resolves({
      data: "foo"
    });
    axios.stubs.instance.resetHistory();
  });

  describe("setHeaders method", () => {
    const headers = {
      foo: "foo-1",
      foo2: "foo-2"
    };
    it("should set the requests headers", async () => {
      expect.assertions(1);
      const books = new Api("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
    });

    it("should override all headers", async () => {
      expect.assertions(2);
      const newHeaders = { ...headers, foo2: "foo-new-2" };
      const books = new Api("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
      books.setHeaders(newHeaders);
      books.clean();
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].headers).toEqual(newHeaders);
    });
  });

  describe("addHeaders method", () => {
    const headers = {
      foo: "foo-1",
      foo2: "foo-2"
    };
    it("should add new headers to requests headers", async () => {
      expect.assertions(2);
      const newHeaders = {
        foo3: "foo-3"
      };
      const books = new Api("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
      books.addHeaders(newHeaders);
      books.clean();
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].headers).toEqual({
        foo: "foo-1",
        foo2: "foo-2",
        foo3: "foo-3"
      });
    });

    it("should override already existing headers", async () => {
      expect.assertions(2);
      const newHeaders = {
        foo2: "foo-4",
        foo3: "foo-3"
      };
      const books = new Api("/books");
      books.setHeaders(headers);
      await books.read();
      expect(axios.stubs.instance.getCall(0).args[0].headers).toEqual(headers);
      books.addHeaders(newHeaders);
      books.clean();
      await books.read();
      expect(axios.stubs.instance.getCall(1).args[0].headers).toEqual({
        foo: "foo-1",
        foo2: "foo-4",
        foo3: "foo-3"
      });
    });
  });
});
