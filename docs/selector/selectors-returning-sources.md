## Selectors returning another source

Selectors can return another source. Then, the returned source will be called with same method and parameters than the Selector was.

Cache listeners will be added too to this returned Selector, so, if returned source cache is cleaned, the Selector cache will be cleaned too.

```js

import { Api } from "@xbyorange/mercury-api";

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
