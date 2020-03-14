const { Selector } = require("../../../../../dist/index.cjs");

const { authorsProvider } = require("./providers");

const authorsSearch = new Selector(authorsProvider, function(authorsResults, query) {
  if (!query.search.length) {
    return [];
  }
  return authorsResults.filter(function(author) {
    return author.name.toLowerCase().indexOf(query.search.toLowerCase()) > -1;
  });
});

module.exports = {
  authorsSearch
};
