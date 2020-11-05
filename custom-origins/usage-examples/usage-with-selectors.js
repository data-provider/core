const { postWithUserData } = require("./selectors");

const runExample = async () => {
  // read posts
  const post = await postWithUserData.query({ id: "1" }).read();
  console.log(post);
};

runExample();
