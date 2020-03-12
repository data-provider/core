const { authorsProvider } = require("./providers");

const deleteAuthor = authorId => {
  return authorsProvider.delete(authorId);
};

const createAuthor = name => {
  return authorsProvider.create({
    name
  });
};

module.exports = {
  deleteAuthor,
  createAuthor
};
