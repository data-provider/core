const { addBooksServerError, addBooksNotFoundError } = require("../stats/storage");

const getBooksSuccess = {
  url: "/api/books/success",
  method: "GET",
  response: {
    status: 200,
    body: [
      {
        author: "Ray Bradbury",
        title: "Fahrenheit 451"
      }
    ]
  }
};

const getBooksServerError = {
  url: "/api/books/server-error",
  method: "GET",
  response: (req, res) => {
    addBooksServerError();
    res.status(500);
    res.send({
      statusCode: 500,
      error: "Internal server error",
      message: "Fake Internal server error"
    });
  }
};

const getBooksNotFoundError = {
  url: "/api/books/not-found-error",
  method: "GET",
  response: (req, res) => {
    addBooksNotFoundError();
    res.status(404);
    res.send({
      statusCode: 404,
      error: "Not found",
      message: "Fake Not found"
    });
  }
};

module.exports = {
  getBooksSuccess,
  getBooksServerError,
  getBooksNotFoundError
};
