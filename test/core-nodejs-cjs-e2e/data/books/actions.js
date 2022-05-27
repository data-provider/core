const { deleteAuthor } = require("../authors");

const { booksProvider } = require("./providers");
const { authorBooks } = require("./selectors");

const deleteBook = (bookId) => {
  return booksProvider.delete(bookId);
};

const deleteAuthorAndBooks = (authorId) => {
  authorBooks
    .query({
      author: authorId,
    })
    .read()
    .then((results) => {
      if (!results.length) {
        deleteAuthor(authorId);
      } else {
        results.forEach((book) => {
          deleteBook(book.id);
        });
        deleteAuthor(authorId);
      }
    });
};

const createBook = ({ title, author }) => {
  return booksProvider.create({
    title,
    author: Number(author),
  });
};

module.exports = {
  deleteBook,
  deleteAuthorAndBooks,
  createBook,
};
