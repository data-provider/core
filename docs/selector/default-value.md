## Default values

Define a default value for the Selector as last argument. Selector `value` property will have that value until real value is ready

```js
const booksAndAuthors = new Selector(
  [booksCollection, authorsCollection],
  booksAndAuthors => ({
    books: booksAndAuthors[0],
    authors: booksAndAuthors[1]
  }),
  []
);
console.log(booksAndAuthors.read.value); // []
```