import { Selector } from "@data-provider/core";

import { authorsProvider } from "data/authors";

import { booksProvider } from "./providers";

export const booksWithAuthorName = new Selector(
  [authorsProvider, booksProvider],
  function (results) {
    return results[1].map(function (book) {
      return {
        id: book.id,
        authorName: results[0].find(function (author) {
          return author.id === book.author;
        }).name,
        title: book.title,
      };
    });
  },
  {
    id: "books-with-author-name",
  }
);

export const booksSearch = new Selector(
  booksWithAuthorName,
  function (booksResults, query) {
    if (!query.search.length) {
      return [];
    }
    return booksResults.filter(function (book) {
      var lowerCaseSearch = query.search.toLowerCase();
      return (
        book.title.toLowerCase().indexOf(lowerCaseSearch) > -1 ||
        book.authorName.toLowerCase().indexOf(lowerCaseSearch) > -1
      );
    });
  },
  {
    id: "books-search",
  }
);

export const authorBooks = new Selector(
  booksProvider,
  function (booksResults, query) {
    return booksResults.filter(function (book) {
      return book.author === query.author;
    });
  },
  {
    id: "author-books",
  }
);

window.booksWithAuthorName = booksWithAuthorName;
