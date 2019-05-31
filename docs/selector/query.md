## Querying Selectors

Selectors can be queried in the same way as Origins. Please read before the [origins query documentation](../origin/query.md) if you haven't do it already.

### Passing query to sources

The query parameters can be passed to each source used in the selector, as well as the results of the previous sources as an array. For doing this, the source to be used has to be defined inside an object with the format:

```js
import { Selector } from "@nex/reactive-data-source";

const specificAuthorBooks = new Selector(
  {
    source: authorsCollection,
    query: nameParameter => ({
      queryString: {
        name: nameParameter
      }
    })
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
    }
  },
  (authorsCollectionResults, booksCollectionResults, nameParameter) => booksCollectionResults
)

// Will request to "http://api.library.com/authors?name=cervantes"
// Will request to "http://api.library.com/books?author_id=23"
await specificAuthorBooks.query("cervantes").read();

```
