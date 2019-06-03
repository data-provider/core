## Sources error handling

Dependant sources of a Selector can return an error. Then, the full Selector will not be resolved. You can catch those source errors and transform them into a data of your convenience, or even delegate or "retry" that source into another source.

Use the `catch` property of a custom source to catch his errors:

```js
import { Selector } from "@xbyorange/mercury";
import { Api } from "@xbyorange/mercury-api";

const alternativeBooksCollectionApi = new Api("http://foo-alternative-api/books")

const specificAuthorBooks = new Selector(
  {
    source: authorsCollection,
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
    source: booksCollection,
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
