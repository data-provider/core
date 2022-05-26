const { Selector } = require("@data-provider/core/dist/index.cjs");

const { authorsProvider } = require("./providers");

const authorsSearch = new Selector(authorsProvider, function (query, authorsResults) {
  if (!query.search.length) {
    return [];
  }
  return authorsResults.filter(function (author) {
    return author.name.toLowerCase().indexOf(query.search.toLowerCase()) > -1;
  });
});

module.exports = {
  authorsSearch,
};
