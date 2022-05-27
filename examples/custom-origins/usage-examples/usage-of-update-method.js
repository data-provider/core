const { jsonPlaceHolderApi } = require("./providers");

const runExample = async () => {
  // update one post
  const result = await jsonPlaceHolderApi.query({ url: "posts/1" }).update({
    title: "Foo new title",
  });

  // Result in this example will be the same as jsonPlaceholderApi does not persist modifications
  console.log(result);
};

runExample();
