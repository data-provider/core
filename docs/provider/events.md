## Events

Each Provider and Selector provides an events API that allows you to react on determinate events:

#### onChange

```js
booksCollection.onChange(method => {
  // method = Method changed. Can be read, create, update or delete.
  console.log(booksCollection[method].value); // Value has changed
});
```

> Use the `removeChangeListener` to remove an specific callback.

#### onChangeAny

```js
booksCollection.onChangeAny(changeDetails => {
  console.log(changeDetails.instance); // Specific filtered instance that has changed.
  console.log(changeDetails.method); // Method changed, can be read, create, update or delete.
  console.log(changeDetails.action); // Action that has produced the change. Read bellow for more details.
  console.log(changeDetails.parameters); // Parameters provided to action that produced the change.
});
```

Actions producing a change can be:

* "createDispatch" - Available as a constant at `booksCollection.actions.create.dispatch`.
* "createSuccess" - Available as a constant at `booksCollection.actions.create.success`.
* "createError" - Available as a constant at `booksCollection.actions.create.error`.
* "readDispatch" - Available as a constant at `booksCollection.actions.read.dispatch`.
* "readSuccess" - Available as a constant at `booksCollection.actions.read.success`.
* "readError" - Available as a constant at `booksCollection.actions.read.success`.
* "updateDispatch" - Available as a constant at `booksCollection.actions.update.dispatch`.
* "updateSuccess" - Available as a constant at `booksCollection.actions.update.success`.
* "updateError" - Available as a constant at `booksCollection.actions.update.success`.
* "deleteDispatch" - Available as a constant at `booksCollection.actions.delete.dispatch`.
* "deleteSuccess" - Available as a constant at `booksCollection.actions.delete.success`.
* "deleteError" - Available as a constant at `booksCollection.actions.delete.success`.

Example of `actions` usage:


```js
booksCollection.onChangeAny(changeDetails => {
  if (changeDetails.action === booksCollection.actions.create.success) {
    console.log("A new book has been created");
  }
  if (changeDetails.action === booksCollection.actions.read.dispatch) {
    console.log("Books collection is being loaded");
  }
  if (changeDetails.action === booksCollection.actions.update.error) {
    console.log("An error ocurred updating a book");
  }
});
```

> Use the `removeChangeAnyListener` to remove an specific callback.

#### onClean

```js
booksCollection.onClean(() => {
  console.log("Books collection cache has been cleaned");
});
```
> Use the `onceClean` method to add a callback that will be executed only once.
> Use the `removeCleanListener` to remove an specific callback.

#### onCleanAny

```js
booksCollection.onCleanAny(cleanDetails => {
  console.log(cleanDetails.instance); // Details about specific filtered instance that has been cleaned.
});
```

> Use the `removeCleanAnyListener` to remove an specific callback.
