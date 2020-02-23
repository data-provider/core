export const TAG = "axios";

export const PATH_SEP = "/";

export const once = func => {
  var executed = false;
  let result;
  return function() {
    if (!executed) {
      result = func.apply(this, arguments);
      executed = true;
    } else {
      func = undefined;
    }
    return result;
  };
};

export const isEmpty = obj => {
  return Object.keys(obj).length === 0;
};
