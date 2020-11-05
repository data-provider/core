const Fetcher = require("../src/Fetcher");

const jsonPlaceHolderApi = new Fetcher("json-placeholder-api", {
  baseUrl: "https://jsonplaceholder.typicode.com/",
  initialState: {
    data: [],
  },
});

module.exports = {
  jsonPlaceHolderApi,
};
