const { addBooksError } = require("../stats/storage");

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

const getBooksError = {
  url: "/api/books/error",
  method: "GET",
  response: (req, res) => {
    addBooksError();
    res.status(500);
    res.send({
      statusCode: 500,
      error: "Internal server error",
      message: "Internal server error"
    });
  }
};

module.exports = {
  getBooksSuccess,
  getBooksError
};
