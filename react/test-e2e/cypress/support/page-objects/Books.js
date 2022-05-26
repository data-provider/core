import List from "./common/List";
import Search from "./common/Search";

class Books extends List {
  constructor() {
    super({
      COLUMN: "#books-column",
      CONTAINER: "#books-container",
      INPUT: "#book-new",
      SUBMIT: "#book-submit",
      SELECT: "#book-author-select",
    });

    this._search = new Search({
      CONTAINER: "#books-search-container",
      SEARCH: "#search-book",
    });
  }

  getSelect() {
    return cy.get(this.SELECTORS.SELECT);
  }

  selectAuthor(id) {
    this.getSelect().select(id);
  }

  add(text, author) {
    this.typeNew(text);
    this.selectAuthor(author);
    this.submitNew();
  }

  get search() {
    return this._search;
  }
}

export default Books;
