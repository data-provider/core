## Asynchronous mutable properties

Selectors methods have three properties that change value depending of the current status: `loading`, `error`, `value`

```js
console.log(books.read.value) // undefined

booksWithAuthors.read();

console.log(books.read.loading) // true

console.log(await booksWithAuthors.read()) // value returned by parser function.

console.log(books.read.loading) // false
console.log(books.read.value) // value returned by parser function.

```
