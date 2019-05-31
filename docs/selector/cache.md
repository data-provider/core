## Cache

Selectors are not executed more than once until a related source cache is cleaned.

```js
let books = await booksWithAuthors.read();

// Value will be returned from cache:
console.log(await booksWithAuthors.read());
console.log(await booksWithAuthors.read());

// Clean authors cache:
booksCollection.clean();

// Now books are fetched again, and parser function is executed. Authors still remain cached.
books = await booksWithAuthors.read();

```

Cache can be cleaned manually using the "clean" method:

```js
booksWithAuthors.clean();

await booksWithAuthors.read(); // Selector will be executed again

```