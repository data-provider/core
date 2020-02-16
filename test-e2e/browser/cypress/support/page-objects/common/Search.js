import List from "./List";

class Search extends List {
  add(text) {
    this.typeNew(text);
    this.submitNew();
  }

  getSearch() {
    return cy.get(this.SELECTORS.SEARCH);
  }

  type(text) {
    this.getSearch().clear();
    this.getSearch().type(text);
  }

  shouldBeLoading() {
    this.getItem(1).should("have.text", "loading...");
  }

  shouldDisplayNoResults() {
    this.getItem(1).should("have.text", "No results");
  }
}

export default Search;
