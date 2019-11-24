## Querying Selectors

Selectors can be queried in the same way as Providers. Please read before the [providers query documentation](../provider/query.md) if you haven't do it already.

### Passing query to providers

The query parameters can be passed to each provider used in the selector, as well as the results of the previous providers as an array. For doing this, the provider to be used has to be defined inside an object with the format:

```js
import { Selector } from "@data-provider/core";

const specificAuthorBooks = new Selector(
  {
    provider: authorsCollection,
    query: nameParameter => ({
      queryString: {
        name: nameParameter
      }
    })
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
    }
  },
  (authorsCollectionResults, booksCollectionResults, nameParameter) => booksCollectionResults
)

// Will request to "http://api.library.com/authors?name=cervantes"
// Will request to "http://api.library.com/books?author_id=23"
await specificAuthorBooks.query("cervantes").read();

```
