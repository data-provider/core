var $ = window.$;
var dataProvider = window.dataProvider;

var $authorsColumn;
var $authorsContainer;
var $authorsSearchContainer;
var $booksColumn;
var $booksContainer;
var $booksSearchContainer;
var $bookAuthorSelect;
var $bookSubmit;
var $bookNew;
var $searchAuthor;
var $searchBook;
var $authorSubmit;
var $authorNew;

var searchListeners = {
  author: null,
  book: null
};

// INITAL COLLECTIONS

var AUTHORS = [
  {
    id: 1,
    name: "George Orwell"
  },
  {
    id: 2,
    name: "Ray Bradbury"
  },
  {
    id: 3,
    name: "Aldous Huxley"
  },
  {
    id: 4,
    name: "Ernest Hemingway"
  }
];

var BOOKS = [
  {
    id: 1,
    author: 1,
    title: "1984"
  },
  {
    id: 2,
    author: 1,
    title: "Animal Farm"
  },
  {
    id: 3,
    author: 2,
    title: "Farenheit 451"
  },
  {
    id: 4,
    author: 3,
    title: "Brave new world"
  },
  {
    id: 5,
    author: 4,
    title: "The Old Man and the Sea"
  }
];

// PROVIDER

class MockProvider extends dataProvider.Provider {
  readMethod() {
    var that = this;
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(that.options.data);
      }, 1000);
    });
  }

  _getLastIndex() {
    if (!this.options.data.length) {
      return 1;
    }
    return this.options.data[this.options.data.length - 1].id + 1;
  }

  delete(id) {
    this.options.data = this.options.data.filter(function(item) {
      return item.id !== id;
    });
    this.cleanCache();
  }

  create(item) {
    this.options.data.push({
      id: this._getLastIndex(),
      ...item
    });
    this.cleanCache();
  }
}

// DATA PROVIDERS

dataProvider.providers.config({
  initialState: {
    data: []
  }
});

var authorsProvider = new MockProvider("authors", {
  data: AUTHORS
});

var booksProvider = new MockProvider("books", {
  data: BOOKS
});

var authorsSearch = new dataProvider.Selector(authorsProvider, function(authorsResults, query) {
  if (!query.search.length) {
    return [];
  }
  return authorsResults.filter(function(author) {
    return author.name.toLowerCase().indexOf(query.search.toLowerCase()) > -1;
  });
});

var booksWithAuthorName = new dataProvider.Selector([authorsProvider, booksProvider], function(
  results
) {
  return results[1].map(function(book) {
    return {
      id: book.id,
      authorName: results[0].find(function(author) {
        return author.id === book.author;
      }).name,
      title: book.title
    };
  });
});

var booksSearch = new dataProvider.Selector(booksWithAuthorName, function(booksResults, query) {
  if (!query.search.length) {
    return [];
  }
  return booksResults.filter(function(book) {
    var lowerCaseSearch = query.search.toLowerCase();
    return (
      book.title.toLowerCase().indexOf(lowerCaseSearch) > -1 ||
      book.authorName.toLowerCase().indexOf(lowerCaseSearch) > -1
    );
  });
});

var authorBooks = new dataProvider.Selector(booksProvider, function(booksResults, query) {
  return booksResults.filter(function(book) {
    return book.author === query.author;
  });
});

// DOM HELPERS

var appendLoading = function($container) {
  $container.append(`<li>loading...</li>`);
};

var setLoading = function($column) {
  $column.addClass("loading");
};

var unsetLoading = function($column) {
  $column.removeClass("loading");
};

var appendNoResults = function($container) {
  $container.append(`<li>No results</li>`);
};

var appendNoOptions = function($container) {
  $container.append(`<option value="-">-</option>`);
};

var authorsOptionsAppender = function($container, authors) {
  authors.forEach(function(author) {
    $container.append(`<option value="${author.id}">${author.name}</option>`);
  });
};

var authorsAppender = function($container, authors, idSuffix = "") {
  authors.forEach(function(author) {
    $container.append(`<li id="author-${author.id}${idSuffix}">${author.name}</li>`);
    $(`<span class="delete">🗑️</span>`)
      .click(function() {
        authorBooks
          .query({
            author: author.id
          })
          .read()
          .then(results => {
            if (!results.length) {
              authorsProvider.delete(author.id);
            } else {
              if (
                window.confirm("Deleting author will delete also related books. Are you sure?")
              ) {
                results.forEach(book => {
                  booksProvider.delete(book.id);
                });
                authorsProvider.delete(author.id);
              }
            }
          });
      })
      .prependTo($(`#author-${author.id}${idSuffix}`));
  });
};

var authorsSearchAppender = function($container, books) {
  authorsAppender($container, books, "-search");
};

var booksAppender = function($container, books, idSuffix = "") {
  books.forEach(function(book) {
    var $content = `<li id="book-${book.id}${idSuffix}"> ${book.title} <span class="author-name">${book.authorName}</span></li>`;
    $container.append($content);
    $(`<span class="book-delete delete">🗑️</span>`)
      .click(function() {
        booksProvider.delete(book.id);
      })
      .prependTo($(`#book-${book.id}${idSuffix}`));
  });
};

var booksSearchAppender = function($container, books) {
  booksAppender($container, books, "-search");
};

var renderItems = function($column, $container, provider, appender) {
  const items = provider.state.data;
  const loading = provider.state.loading;
  $container.empty();
  if (loading) {
    setLoading($column);
  } else {
    unsetLoading($column);
  }
  if (!items.length) {
    appendNoResults($container);
  } else {
    appender($container, items);
  }
};

var renderResults = function($container, provider, appender) {
  const items = provider.state.data;
  const loading = provider.state.loading;
  $container.empty();
  if (loading) {
    appendLoading($container);
  } else if (!items.length) {
    appendNoResults($container);
  } else {
    appender($container, items);
  }
};

var renderOptions = function($container, provider, appender) {
  const items = provider.state.data;
  const loading = provider.state.loading;
  $container.empty();
  if (loading || !items.length) {
    appendNoOptions($container);
  } else {
    appender($container, items);
  }
};

var debounce = function(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

var initSearchField = function($input, listenerId, $resultsContainer, provider, appender) {
  $input.on(
    "keyup",
    debounce(function() {
      var searchValue = $input.val();
      var currentSearch;
      if (searchListeners[listenerId]) {
        searchListeners[listenerId][0]();
        searchListeners[listenerId][1]();
      }
      if (!searchValue.length) {
        $resultsContainer.empty();
      } else {
        currentSearch = provider.query({
          search: searchValue
        });
        var refreshView = function() {
          renderResults($resultsContainer, currentSearch, appender);
        };
        searchListeners[listenerId] = [];
        searchListeners[listenerId].push(currentSearch.on("changeState", refreshView));
        searchListeners[listenerId].push(
          currentSearch.on("cleanCache", function() {
            currentSearch.read();
          })
        );
        refreshView();
        currentSearch.read();
      }
    }, 250)
  );
};

// INITIALIZATION

$.when($.ready).then(function() {
  $authorsColumn = $("#authors-column");
  $authorsContainer = $("#authors-container");
  $authorsSearchContainer = $("#authors-search-container");
  $authorSubmit = $("#author-submit");
  $authorNew = $("#author-new");
  $booksColumn = $("#books-column");
  $booksContainer = $("#books-container");
  $booksSearchContainer = $("#books-search-container");
  $bookAuthorSelect = $("#book-author-select");
  $bookSubmit = $("#book-submit");
  $bookNew = $("#book-new");
  $searchAuthor = $("#search-author");
  $searchBook = $("#search-book");

  initSearchField(
    $searchAuthor,
    "author",
    $authorsSearchContainer,
    authorsSearch,
    authorsSearchAppender
  );

  initSearchField($searchBook, "book", $booksSearchContainer, booksSearch, booksSearchAppender);

  authorsProvider.on("changeState", function() {
    renderItems($authorsColumn, $authorsContainer, authorsProvider, authorsAppender);
    renderOptions($bookAuthorSelect, authorsProvider, authorsOptionsAppender);
  });
  authorsProvider.on("cleanCache", function() {
    authorsProvider.read();
  });
  authorsProvider.read();

  $bookSubmit.click(function() {
    var title = $bookNew.val();
    var author = $bookAuthorSelect.val();
    if (title.length < 1 || author === "-") {
      alert("Please enter valid book and author");
    } else {
      booksProvider.create({
        title: title,
        author: Number(author)
      });
      $bookNew.val("");
    }
  });

  $authorSubmit.click(function() {
    var name = $authorNew.val();
    if (name.length < 1) {
      alert("Please enter valid author name");
    } else {
      authorsProvider.create({
        name: name
      });
      $authorNew.val("");
    }
  });

  booksWithAuthorName.on("changeState", function() {
    renderItems($booksColumn, $booksContainer, booksWithAuthorName, booksAppender);
  });
  booksWithAuthorName.on("cleanCache", function() {
    booksWithAuthorName.read();
  });
  booksWithAuthorName.read();
});
