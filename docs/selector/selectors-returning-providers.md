## Selectors returning another provider

Selectors can return another provider or array of providers. Then, the returned providers will be called with same method and parameters than the Selector was.

Cache listeners will be added too to this returned Selector, so, if any of the returned providers cache is cleaned, the Selector cache will be cleaned too.

```js

import { Api } from "@data-provider/axios";

const commonBookModel = new Api("http://common-api/books/:id");

const publicBookModel = new Api("http://public-api/books/:id");
const privateBookModel = new Api("http://private-api/books/:id");

const bookDetails = new Selector(
  {
    provider: commonBookModel,
    query: queriedId => ({
      urlParams: {
        id: queriedId
      }
    })
  },
  (bookModelResult, queriedId) => {
    const apiToCall = bookModelResult.isPrivate ? privateLibraryApi : publicLibraryApi;
    return apiToCall.query({
      urlParams: {
        id: queriedId
      }
    });
  }
);

// First call to common api to know if it is private or public, then call to correspondant api.

const bookModel = await bookDetails.query("foo-id").read();

```

Selectors returning another selector have available all CRUD methods. The methos applied to the selector will be the same method applied to the returned provider, original parameters will be passed too:

```js

// First call to common api to know if it is private or public, then it will send the update to correspondant api.

await bookDetails.query("foo-id").update({
  name: "foo"
});

```

Selectors can return an array of providers:

```js

import { Api } from "@data-provider/axios";

import { authorsProvider } from "./authors";
import { booksProvider } from "./books";

const authorBooksData = new Selector(
  {
    provider: authorsProvider,
    query: queriedId => ({
      urlParams: {
        id: queriedId
      }
    })
  },
  authorDetails => {
    return authorDetails.booksIds.map(bookId => booksProvider.query({
      urlParams: {
        id: bookId
      }
    }))
  }
);

// Call to api "n" times for recovering data of all books of author with id "foo-id"
const authorBooksData = await authorBooksData.query("foo-id").read();

```

Returned providers can be defined as objects containing query callback or catch functions as well:

```js

import { Api } from "@data-provider/axios";

import { authorsProvider } from "./authors";
import { booksProvider } from "./books";

const authorBooksData = new Selector(
  {
    provider: authorsProvider,
    query: queriedId => ({
      urlParams: {
        id: queriedId
      }
    })
  },
  authorDetails => {
    return authorDetails.booksIds.map(bookId => ({
      provider: booksProvider,
      query: () => ({
        urlParams: {
          id: bookId
        }
      }),
      catch: () => Promise.resolve({
        title: "Error recovering book title"
      })
    }))
  }
);

const authorBooksData = await authorBooksData.query("foo-id").read();

```

