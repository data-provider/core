export const defaultConfig = {
  baseUrl: "",
  readMethod: "get",
  updateMethod: "patch",
  createMethod: "post",
  deleteMethod: "delete",
  authErrorStatus: 401,
  authErrorHandler: null,
  onBeforeRequest: null,
  onceBeforeRequest: null,
  expirationTime: 0,
  retries: 3,
  cache: true,
  fullResponse: false,
  validateStatus: status => status >= 200 && status < 300,
  validateResponse: null,
  errorHandler: error => {
    const errorMessage =
      (error.response && error.response.statusText) || error.message || "Request error";
    const errorToReturn = new Error(errorMessage);
    errorToReturn.data = error.response && error.response.data;
    return Promise.reject(errorToReturn);
  }
};
