const { jsonPlaceHolderApi } = require("./providers");

const runExample = async () => {
  // read posts
  const posts = await jsonPlaceHolderApi.query({ url: "posts" }).read();
  console.log(posts);

  // read posts again. Fectch is not executed again, as the response is cached
  await jsonPlaceHolderApi.query({ url: "posts" }).read();

  // read posts
  const users = await jsonPlaceHolderApi.query({ url: "users" }).read();
  console.log(users);
};

runExample();
