const INITIAL_STATS = {
  books: {
    serverError: 0,
    notFoundError: 0
  }
};
let stats;

const addBooksServerError = () => {
  stats.books.serverError = stats.books.serverError + 1;
};

const addBooksNotFoundError = () => {
  stats.books.notFoundError = stats.books.notFoundError + 1;
};

const reset = () => {
  stats = JSON.parse(JSON.stringify(INITIAL_STATS));
};

const getAll = () => stats;

reset();

module.exports = {
  addBooksServerError,
  addBooksNotFoundError,
  getAll,
  reset
};
