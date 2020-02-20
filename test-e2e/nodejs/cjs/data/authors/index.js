const { deleteAuthor, createAuthor } = require("./actions");
const { authorsProvider } = require("./providers");
const { authorsSearch } = require("./selectors");

module.exports = {
  deleteAuthor,
  createAuthor,
  authorsProvider,
  authorsSearch
};
