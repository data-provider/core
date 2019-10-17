const { Feature } = require("@xbyorange/mocks-server");

const { getBooksSuccess, getBooksError } = require("./fixtures/books/get");
const { getStats } = require("./fixtures/stats/get");
const { resetStats } = require("./fixtures/stats/post");

const base = new Feature([getBooksSuccess, getBooksError, getStats, resetStats]);

module.exports = {
  base
};
