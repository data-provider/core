const { Feature } = require("@xbyorange/mocks-server");

const { getBooksSuccess, getBooksError, getApiStatsBooksFail } = require("./fixtures/books/get");

const base = new Feature([getBooksSuccess, getBooksError, getApiStatsBooksFail]);

module.exports = {
  base
};
