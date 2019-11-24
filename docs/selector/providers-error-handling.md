## Providers error handling

Dependant providers of a Selector can return an error. Then, the full Selector will not be resolved. You can catch those provider errors and transform them into a data of your convenience, or even delegate or "retry" that provider into another provider or array of providers.

Use the `catch` property of a custom provider to catch his errors:

```js
import { Selector } from "@data-provider/core";
import { Api } from "@data-provider/axios";

const alternativeBooksCollectionApi = new Api("http://foo-alternative-api/books")

const specificAuthorBooks = new Selector(
  {
    provider: authorsCollection,
    query: nameParameter => ({
      queryString: {
        name: nameParameter
      }
    }),
    catch: (err, query) => {
      return []
    }
  },
  {
    provider: booksCollection,
    query: (nameParameter, previousResults) => {
      const authorsResults = previousResults[0];
      return {
        queryString: {
          author_id: authorsResults[0]._id
        }
      }
    },
    catch: (err, query) => {
      return alternativeBooksCollectionApi.query(query);
    }
  },
  (authorsCollectionResults, booksCollectionResults, nameParameter) => booksCollectionResults
)

// If request to "http://api.library.com/authors?name=cervantes" fails, will be resolved with an empty array:
// If request to "http://api.library.com/books?author_id=23" fails, will retry on "http://foo-alternative-api/books?author_id=23"
await specificAuthorBooks.query("cervantes").read();

```
