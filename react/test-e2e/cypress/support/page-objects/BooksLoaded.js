import List from "./common/List";

class BooksLoaded extends List {
  constructor() {
    super({
      COLUMN: "#books-loaded-column",
      CONTAINER: "#books-loaded-container",
    });
  }
}

export default BooksLoaded;
