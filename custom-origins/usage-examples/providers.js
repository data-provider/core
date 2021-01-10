const Fetcher = require("../src/Fetcher");

const jsonPlaceHolderApi = new Fetcher({
  url: "json-placeholder-api",
  baseUrl: "https://jsonplaceholder.typicode.com/",
  initialState: {
    data: [],
  },
});

module.exports = {
  jsonPlaceHolderApi,
};
