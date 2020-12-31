const { SelectorV3 } = require("../../../../../dist/index.cjs");

const { authorsProvider } = require("../authors");

const { booksProvider } = require("./providers");

const booksWithAuthorName = new SelectorV3([authorsProvider, booksProvider], function (
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

const booksSearch = new SelectorV3(booksWithAuthorName, function (query, booksResults) {
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

const authorBooks = new SelectorV3(booksProvider, function (query, booksResults) {
  return booksResults.filter(function (book) {
    return book.author === query.author;
  });
});

module.exports = {
  booksWithAuthorName,
  booksSearch,
  authorBooks,
};
