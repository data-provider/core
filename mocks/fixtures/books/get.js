let failCallCount = 0;

const getApiStatsBooksFail = {
  url: "/api-stats/books/error",
  method: "GET",
  response: (req, res) => {
    res.status(200);
    res.send({
      callCount: failCallCount
    });
  }
};

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
    failCallCount++;
    res.status(500);
    res.send({
      statusCode: 500,
      error: "Internal server error",
      message: "Internal server error"
    });
  }
};

module.exports = {
  getApiStatsBooksFail,
  getBooksSuccess,
  getBooksError
};
