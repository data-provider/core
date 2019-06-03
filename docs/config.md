### Configuration example

As first argument, the api url should be provided. Base url can be defined afterwards using config method.

```js
import { Api } from "@xbyorange/mercury-api";

const booksCollection = new Api("/books");
```

As second argument, a configuration object can be passed. This will define the default configuration, that can be overriden again in any moment using the `config` method. In the next example, default configuration is shown:

```js
const booksCollection = new Api("/books", {
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
  validateReponse: null,
  errorHandler: error => {
    const errorMessage =
      (error.response && error.response.statusText) || error.message || "Request error";
    const errorToReturn = new Error(errorMessage);
    errorToReturn.data = error.response && error.response.data;
    return Promise.reject(errorToReturn);
  }
});
```

> Use the `config` method to override configuration properties at any moment. (Except `defaultValue` option, that can't be modified using this method)

```js
booksCollection.config({
  baseUrl: "http://localhost:3100"
});
```
