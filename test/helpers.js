export const wait = (time = 200) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
