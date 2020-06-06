class List {
  constructor(selectors) {
    this.SELECTORS = selectors;
  }

  getColumn() {
    return cy.get(this.SELECTORS.COLUMN);
  }

  getContainer() {
    return cy.get(this.SELECTORS.CONTAINER);
  }

  getPlaceholder() {
    return cy.get(this.SELECTORS.PLACEHOLDER);
  }

  getInput() {
    return cy.get(this.SELECTORS.INPUT);
  }

  getSubmit() {
    return cy.get(this.SELECTORS.SUBMIT);
  }

  getItems() {
    return this.getContainer().find("li");
  }

  getItem(index) {
    return this.getItems().eq(index - 1);
  }

  getDelete(index) {
    return this.getItem(index).find("span").eq(0);
  }

  shouldDisplayPlaceholder() {
    this.getPlaceholder().should("be.visible");
  }

  shouldNotDisplayPlaceholder() {
    this.getPlaceholder().should("not.be.visible");
  }

  shouldDisplayItems(number) {
    this.getItems().should("have.length", number);
  }

  shouldDisplayItem(index, text) {
    this.getItem(index).should("have.text", `🗑️ ${text}`);
  }

  shouldBeLoading() {
    this.getColumn().should("have.class", "loading");
  }

  shouldNotBeLoading() {
    this.getColumn().should("not.have.class", "loading");
  }

  delete(index) {
    this.getDelete(index).click();
  }

  typeNew(text) {
    this.getInput().type(text);
  }

  submitNew() {
    this.getSubmit().click();
  }
}

export default List;