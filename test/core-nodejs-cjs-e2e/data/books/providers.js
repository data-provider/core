const MockProvider = require("../mock-provider");

const BOOKS = [
  {
    id: 1,
    author: 1,
    title: "1984",
  },
  {
    id: 2,
    author: 1,
    title: "Animal Farm",
  },
  {
    id: 3,
    author: 2,
    title: "Farenheit 451",
  },
  {
    id: 4,
    author: 3,
    title: "Brave new world",
  },
  {
    id: 5,
    author: 4,
    title: "The Old Man and the Sea",
  },
];

const booksProvider = new MockProvider({
  id: "books",
  data: BOOKS,
});

module.exports = {
  booksProvider,
};
