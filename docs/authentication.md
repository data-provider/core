### Authentication example

Here you have an example of a JWT authentication implementation.

In this example, when an user lands to an authentication required section, all needed api calls will be executed, failed, then, if a refresh token exists, a new access tokenwill be automatically requested, and all previously failed requests will be retried again, but now authenticated.

```js
import { booksCollection } from "src/data/books";
import { authorsCollection } from "src/data/authors";
import { accessTokens } from "src/data/authorization";

let loginPromise;

// Login automatically using refresh token
const doLogin = refreshToken => {
  return accessTokens
    .create({
      refreshToken
    })
    .then(response => {
      [booksCollection, authorsCollection].forEach(provider => {
        provider.addHeaders({
          Authorization: `Bearer ${response.accessToken}`
        });
      });
      return Promise.resolve();
    });
};

const authErrorHandler = (provider, retry) => {
  const refreshToken = localStorage.getItem("refreshToken");
  // User has a refresh token, renew the authentication automatically
  if (refreshToken) {
    if (!loginPromise) {
      loginPromise = doLogin(refreshToken);
    }

    return loginPromise
      .catch(err => {
        // Login has failed, delete the cached promise to allow execute it again
        loginPromise = null;
        return Promise.reject(err);
      })
      .then(retry);
  }
  // User has not a refresh token, redirect to login
  window.location.assign("/login");
  return Promise.reject(new Error("Not refresh token found"));
};

authorsCollection.config({
  authErrorHandler
});

booksCollection.config({
  authErrorHandler
});
```

> Note that the authErrorHandler method is executed by all providers that have received an authentication error. In a common scenario, multiple requests will fail at the same time when you are loading the page for the first time without being authenticated. This is the reason why the login method promise is being "cached" and executed only once, except when it fails.
