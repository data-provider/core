## Asynchronous mutable properties

Selectors methods have four properties that change value depending of the current status: `loading`, `error`, `value` and `stats`

```js
console.log(books.read.value) // undefined

booksWithAuthors.read();

console.log(books.read.loading) // true

console.log(await booksWithAuthors.read()) // value returned by parser function.

console.log(books.read.loading) // false
console.log(books.read.value) // value returned by parser function.

```

The `stats` property can be used to determine how many times a selector method has been dispatched, successfully read or errored.

It contains three counters corresponding to each method "action":

* `dispatch` - Increased each time the read method is dispatched and there is no cache.
* `success` - Increased each time the read method is called and it is resolved. No matter if result comes from cache or not.
* `error` - Increased each time the read method is called and it is rejected. No matter if result comes from cache or not.

```js
console.log(books.read.stats.dispatch) // 0
console.log(books.read.stats.error) // 0
console.log(books.read.stats.success) // 0

booksWithAuthors.read();

console.log(books.read.stats.dispatch) // 1

await booksWithAuthors.read()

console.log(books.read.stats.success) // 2

```