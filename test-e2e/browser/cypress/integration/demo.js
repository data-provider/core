describe("Demo page", () => {
  const SELECTORS = {
    AUTHORS_CONTAINER: "#authors-container"
  };

  before(() => {
    cy.visit("/");
  });

  describe("authors column", () => {
    it("should display 4 results", () => {
      cy.get(SELECTORS.AUTHORS_CONTAINER).find("li").should("have.length", 4);
    });  
  });
});