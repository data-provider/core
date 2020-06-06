import List from "./common/List";
import Search from "./common/Search";

class Authors extends List {
  constructor() {
    super({
      COLUMN: "#authors-column",
      CONTAINER: "#authors-container",
      INPUT: "#author-new",
      SUBMIT: "#author-submit",
      PLACEHOLDER: "#authors-placeholder",
    });

    this._search = new Search({
      CONTAINER: "#authors-search-container",
      SEARCH: "#search-author",
    });
  }

  add(text) {
    this.typeNew(text);
    this.submitNew();
  }

  get search() {
    return this._search;
  }
}

export default Authors;
