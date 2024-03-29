const { Selector } = require("@data-provider/core");
const { jsonPlaceHolderApi } = require("./providers");

const postWithUserData = new Selector(
  (queryValue) => jsonPlaceHolderApi.query({ url: `posts/${queryValue.id}` }),
  (_queryValue, post) => jsonPlaceHolderApi.query({ url: `users/${post.userId}` }),
  (_queryValue, postData, userData) => {
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
