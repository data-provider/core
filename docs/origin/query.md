## Querying Origins

Each origin can have subgroups of data that implements its own cache, and have all CRUD and other methods, such as the "root" origin

The query parameters of this example are exclusive of the "api" origin, other resources will accept another querying parameters. Read each "origin" documentation for further details about each specific implementation.

```js
// Get a subcollection querying the "root" origin:
const cervantesBooksCollection = booksCollection.query({
  queryString: {
    author: "cervantes"
  }
});

// Will request to "http://api.library.com/books?author=cervantes"
const cervantesBooks = await cervantesBooksCollection.read()
```

#### Queries are chainable

A "queried" origin can be queryed itself, returning another instance implementing all methods as well. The resultant query will be the result of "deep" extending all previous queries with the new query (see the [lodash merge](https://lodash.com/docs/4.17.11#merge) function)

```js
const cervantes1605BooksCollection = cervantesBooksCollection.query({
  queryString: {
    year: 1605
  }
});

// Will request to "http://api.library.com/books?author=cervantes&year=1605"
const cervantes1605Books = await cervantes1605BooksCollection.read()

```

#### Adding custom queries

You can define your own query helpers for querying with specific data structure. They can be interpreted as origin query helpers:

```js
// Add a custom query for retrieving books of an specific author
booksCollection.addCustomQuery({
  ofAuthor: author => ({
    queryString: {
      author
    }
  })
});

// Will request to "http://api.library.com/books?author=cervantes"
const cervantesBooks = booksCollection.ofAuthor("cervantes")
await cervantesBooks.read();

```

#### Custom queries are chainable too

Custom queries methods are chainable too, so you can "nest" your custom queries:

```js
booksCollection.addCustomQuery({
  ofYear: year => ({
    queryString: {
      year
    }
  })
});

// Will request to "http://api.library.com/books?author=cervantes&year=1605"
const cervantes1605Books = await booksCollection.ofAuthor("cervantes").ofYear(1605).read();

```
