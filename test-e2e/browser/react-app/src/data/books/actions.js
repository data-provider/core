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
        if (window.confirm("Deleting author will delete also related books. Are you sure?")) {
          results.forEach(book => {
            deleteBook(book.id);
          });
          deleteAuthor(authorId);
        }
      }
    });
};
