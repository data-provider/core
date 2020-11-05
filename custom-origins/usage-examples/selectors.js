const { Selector } = require("@data-provider/core");
const { jsonPlaceHolderApi } = require("./providers");

const postWithUserData = new Selector(
  (query) => jsonPlaceHolderApi.query({ url: `posts/${query.id}` }),
  (query, previousResults) =>
    jsonPlaceHolderApi.query({ url: `users/${previousResults[0].userId}` }),
  (postData, userData) => {
    return {
      ...postData,
      userName: userData.name,
      userEmail: userData.email,
    };
  },
  {
    id: "post-with-user-data",
  }
);

module.exports = {
  postWithUserData,
};
