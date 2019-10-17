const { reset } = require("./storage");

const resetStats = {
  url: "/api/stats/reset",
  method: "POST",
  response: (req, res) => {
    reset();
    res.status(200);
    res.send();
  }
};

module.exports = {
  resetStats
};
