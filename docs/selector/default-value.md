## Default values

Define a default value for the Selector using options in last argument. Selector `value` property will have that value until real value is ready

```js
const booksAndAuthors = new Selector(
  [booksCollection, authorsCollection],
  booksAndAuthors => ({
    books: booksAndAuthors[0],
    authors: booksAndAuthors[1]
  }),
  {
    defaultValue: []
  }
);
console.log(booksAndAuthors.read.value); // []
```