const MockProvider = require("../mock-provider");

const AUTHORS = [
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

const authorsProvider = new MockProvider("authors", {
  data: AUTHORS
});

module.exports = {
  authorsProvider
};
