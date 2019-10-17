const { getAll } = require("./storage");

const getStats = {
  url: "/api/stats/call-count",
  method: "GET",
  response: (req, res) => {
    res.status(200);
    res.send(getAll());
  }
};

module.exports = {
  getStats
};
