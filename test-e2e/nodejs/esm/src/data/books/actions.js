import { deleteAuthor } from "data/authors";
import { booksProvider } from "./providers";
import { authorBooks } from "./selectors";

export const deleteBook = bookId => {
  return booksProvider.delete(bookId);
};

export const deleteAuthorAndBooks = authorId => {
  authorBooks
    .query({
      author: authorId
    })
    .read()
    .then(results => {
      if (!results.length) {
        deleteAuthor(authorId);
      } else {
        results.forEach(book => {
          deleteBook(book.id);
        });
        deleteAuthor(authorId);
      }
    });
};

export const createBook = ({ title, author }) => {
  return booksProvider.create({
    title,
    author: Number(author)
  });
};
