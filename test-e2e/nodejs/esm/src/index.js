import { authorsSearch, authorsProvider, createAuthor } from "./data/authors";
import {
  booksWithAuthorName,
  booksSearch,
  deleteAuthorAndBooks,
  deleteBook,
  createBook,
} from "./data/books";

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const runTests = async () => {
  let totalExpects = 20;
  let expects = 0;
  let interval = setInterval(() => {
    console.error("Timed out");
    process.exit(1);
  }, 20000);

  const finish = () => {
    console.log("Finished OK");
    clearInterval(interval);
  };

  const expect = (assertion, value) => {
    expects++;
    console.log(`- ${assertion}: ${value ? "ok" : "ko"}`);
    if (!value) {
      console.error("ERROR");
      process.exit(1);
    }
    if (expects === totalExpects) {
      finish();
    }
  };

  authorsProvider.read();
  expect("authors should be loading", authorsProvider.state.loading === true);
  const authorsResult = await authorsProvider.read();
  expect("should be there 4 authors", authorsResult.length === 4);
  expect("authors should not be loading", authorsProvider.state.loading === false);

  booksWithAuthorName.read();
  expect("booksWithAuthorName should be loading", booksWithAuthorName.state.loading === true);
  const booksWithAuthorNameResult = await booksWithAuthorName.read();
  expect("should be there 5 books", booksWithAuthorNameResult.length === 5);
  expect("books should not be loading", booksWithAuthorName.state.loading === false);

  const currentBooksSearch = booksSearch.query({ search: "geo" });
  currentBooksSearch.read();
  expect("currentBooksSearch should be loading", currentBooksSearch.state.loading === true);
  const currentBooksSearchResult = await currentBooksSearch.read();
  expect("should be there 2 books in search result", currentBooksSearchResult.length === 2);
  expect("currentBooksSearch should not be loading", currentBooksSearch.state.loading === false);

  const currentAuthorsSearch = authorsSearch.query({ search: "ray" });
  currentAuthorsSearch.read();
  expect("currentAuthorsSearch should be loading", currentAuthorsSearch.state.loading === true);
  const currentAuthorsSearchResult = await currentAuthorsSearch.read();
  expect("should be there 1 author in search", currentAuthorsSearchResult.length === 1);
  expect(
    "currentAuthorsSearch should not be loading",
    currentAuthorsSearch.state.loading === false
  );

  booksWithAuthorName.once("cleanCache", async () => {
    await booksWithAuthorName.read();
    expect(
      "should be there 4 books after deleting Ray Bradbury",
      booksWithAuthorName.state.data.length === 4
    );
    await authorsProvider.read();
    expect(
      "should be there 3 authors after deleting Ray Bradbury",
      authorsProvider.state.data.length === 3
    );
  });

  currentBooksSearch.once("cleanCache", async () => {
    await currentBooksSearch.read();
    expect(
      "should be there 2 books in search after deleting Ray Bradbury",
      currentBooksSearch.state.data.length === 2
    );
  });

  currentAuthorsSearch.once("cleanCache", async () => {
    await currentAuthorsSearch.read();
    expect(
      "should be there 0 authors in search after deleting Ray Bradbury",
      currentAuthorsSearch.state.data.length === 0
    );
  });

  deleteAuthorAndBooks(2);

  // Wait for all events to be resolved before adding more listeners
  await wait(1500);

  currentBooksSearch.once("cleanCache", async () => {
    await currentBooksSearch.read();
    expect(
      "should be there 1 book in search after deleting 1984 book",
      currentBooksSearch.state.data.length === 1
    );
  });

  deleteBook(1);

  // Wait for all events to be resolved before adding more listeners
  await wait(1500);

  currentBooksSearch.once("cleanCache", async () => {
    await currentBooksSearch.read();
    expect(
      "should be there 0 books in search after deleting George Orwell author",
      currentBooksSearch.state.data.length === 0
    );
  });

  deleteAuthorAndBooks(1);

  currentAuthorsSearch.once("cleanCache", async () => {
    await currentAuthorsSearch.read();
    expect(
      "should be there 1 authors in search after adding another author containing ray",
      currentAuthorsSearch.state.data.length === 1
    );
  });

  createAuthor("Ray");

  // Wait for all events to be resolved before adding more listeners
  await wait(1500);

  currentBooksSearch.once("cleanCache", async () => {
    await currentBooksSearch.read();
    expect(
      "should be there 1 books in search after adding one book containing Geo",
      currentBooksSearch.state.data.length === 1
    );
  });

  createBook({
    title: "Geo",
    author: 4,
  });

  await wait(1500);
};

runTests();
