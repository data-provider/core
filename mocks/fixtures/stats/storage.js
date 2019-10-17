const INITIAL_STATS = {
  books: {
    error: 0
  }
};
let stats;

const addBooksError = () => {
  stats.books.error = stats.books.error + 1;
};

const reset = () => {
  stats = JSON.parse(JSON.stringify(INITIAL_STATS));
};

const getAll = () => stats;

reset();

module.exports = {
  addBooksError,
  getAll,
  reset
};
