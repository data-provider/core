const INITIAL_STATS = {
  books: {
    notFoundError: 0,
    serverError: 0,
    success: 0
  }
};
let stats;

const addBooksServerError = () => {
  stats.books.serverError = stats.books.serverError + 1;
};

const addBooksNotFoundError = () => {
  stats.books.notFoundError = stats.books.notFoundError + 1;
};

const addBooksSuccess = () => {
  stats.books.success = stats.books.success + 1;
};

const reset = () => {
  stats = JSON.parse(JSON.stringify(INITIAL_STATS));
};

const getAll = () => stats;

reset();

module.exports = {
  addBooksServerError,
  addBooksNotFoundError,
  addBooksSuccess,
  getAll,
  reset
};
