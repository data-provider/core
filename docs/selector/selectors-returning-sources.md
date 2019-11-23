## Selectors returning another source

Selectors can return another source or array of sources. Then, the returned sources will be called with same method and parameters than the Selector was.

Cache listeners will be added too to this returned Selector, so, if any of the returned sources cache is cleaned, the Selector cache will be cleaned too.

```js

import { Api } from "@data-provider/axios";

const commonBookModel = new Api("http://common-api/books/:id");

const publicBookModel = new Api("http://public-api/books/:id");
const privateBookModel = new Api("http://private-api/books/:id");

const bookDetails = new Selector(
  {
    source: commonBookModel,
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

Selectors returning another selector have available all CRUD methods. The methos applied to the selector will be the same method applied to the returned source, original parameters will be passed too:

```js

// First call to common api to know if it is private or public, then it will send the update to correspondant api.

await bookDetails.query("foo-id").update({
  name: "foo"
});

```

Selectors can return an array of sources:

```js

import { Api } from "@data-provider/axios";

import { authorsOrigin } from "./authors";
import { booksOrigin } from "./books";

const authorBooksData = new Selector(
  {
    source: authorsOrigin,
    query: queriedId => ({
      urlParams: {
        id: queriedId
      }
    })
  },
  authorDetails => {
    return authorDetails.booksIds.map(bookId => booksOrigin.query({
      urlParams: {
        id: bookId
      }
    }))
  }
);

// Call to api "n" times for recovering data of all books of author with id "foo-id"
const authorBooksData = await authorBooksData.query("foo-id").read();

```

Returned sources can be defined as objects containing query callback or catch functions as well:

```js

import { Api } from "@data-provider/axios";

import { authorsOrigin } from "./authors";
import { booksOrigin } from "./books";

const authorBooksData = new Selector(
  {
    source: authorsOrigin,
    query: queriedId => ({
      urlParams: {
        id: queriedId
      }
    })
  },
  authorDetails => {
    return authorDetails.booksIds.map(bookId => ({
      source: booksOrigin,
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

