## Testing

Selectors provides a test api for making easier developing unit tests.

#### Testing selector functions

```js
const mySelector = new Selector({
  booksCollection
}, results => results[0]);
```

```js
expect(mySelector.test.selector(["foo"])).toEqual("foo");
```

#### Testing selector queries

```js
const mySelector = new Selector({
  source: booksCollection,
  query: id => {
    params: {
      id
    }
  }
}, result => result);
```

```js
expect(mySelector.test.queries[0]("foo")).toEqual({
  params: {
    id: "foo"
  }
});
```

#### Testing selector sources "catch" methods

```js
const mySelector = new Selector({
  source: booksCollection,
  query: id => {
    params: {
      id
    }
  },
  catch: err => err.message
}, result => result);
```

```js
expect(mySelector.test.catches[0](new Error("foo"))).toEqual("foo");
```

#### Testing selector queries and catches when sources are concurrent

For concurrent sources, testing objects will be exposed inside an array in the same order than sources are declared.

```js
const mySelector = new Selector(
  [{
    source: booksCollection,
    query: id => {
      params: {
        bookId
      }
    },
    catch: () => "Error retrieving books";
  },
  {
    source: authorsCollection,
    query: id => {
      params: {
        authorId
      }
    },
    catch: () => "Error retrieving authors";
  }]
  , result => result);
```

```js
expect(mySelector.test.queries[0][0]("foo")).toEqual({
  params: {
    bookId: "foo"
  }
});

expect(mySelector.test.queries[0][1]("foo")).toEqual({
  params: {
    authorId: "foo"
  }
});

expect(mySelector.test.catches[0][0]()).toEqual("Error retrieving books");

expect(mySelector.test.catches[0][1]()).toEqual("Error retrieving authors");
```

#### Testing custom queries

```js
booksCollection.addCustomQuery({
  myQuery: id => ({
    params: {
      id
    }
  })
});

```

```js
expect(booksCollection.test.customQueries.myQuery("foo")).toEqual({
  params: {
    id: "foo"
  }
});
```
