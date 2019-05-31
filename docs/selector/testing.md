## Testing

Selectors provides a test api for making easier developing unit tests.

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

#### Testing selector functions

```js
const mySelector = new Selector({
  booksCollection
}, results => results[0]);
```

```js
expect(mySelector.test.selector(["foo"])).toEqual("foo");
```