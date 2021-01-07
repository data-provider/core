import { SelectorV3 } from "@data-provider/core";

import { authorsProvider } from "data/authors";

import { booksProvider } from "./providers";

export const booksWithAuthorName = new SelectorV3([authorsProvider, booksProvider], function (
  query,
  results
) {
  return results[1].map(function (book) {
    return {
      id: book.id,
      authorName: results[0].find(function (author) {
        return author.id === book.author;
      }).name,
      title: book.title,
    };
  });
});

export const booksSearch = new SelectorV3(booksWithAuthorName, function (query, booksResults) {
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
});

export const authorBooks = new SelectorV3(booksProvider, function (query, booksResults) {
  return booksResults.filter(function (book) {
    return book.author === query.author;
  });
});
