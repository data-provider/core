## Parallel sources

You can read source results in parallel simply defining sources in an array:

```js

const booksWithAuthors = new Selector(
  [
    booksCollection,
    authorsCollection
  ],
  booksAndAuthors => {
    const books = booksAndAuthors[0];
    const authors = booksAndAuthors[1];
    return booksResults.map(book => ({
      ...book,
      authorName: authorsResults.find(author => author.id === book.author)
    }))
  }
);

// Now books and authors fetchs are executed in parallel
const results = await booksWithAuthors.read();

```
