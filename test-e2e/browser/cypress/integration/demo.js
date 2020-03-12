import Books from "../support/page-objects/Books";
import Authors from "../support/page-objects/Authors";

describe("Demo page", () => {
  const NEW_AUTHOR = "Cervantes";
  const NEW_AUTHOR_2 = "James Alan Gardner";
  const NEW_BOOK = "Don Quijote";
  const NEW_BOOK_2 = "Don Quijote parte 1";
  let books;
  let authors;

  before(() => {
    books = new Books();
    authors = new Authors();
    cy.visit("/");
  });

  describe("loaders", () => {
    it("should display books loading", () => {
      authors.shouldBeLoading();
    });

    it("should display authors loading", () => {
      books.shouldBeLoading();
    });
  });

  describe("authors column", () => {
    it("should display 4 results", () => {
      authors.shouldDisplayItems(4);
    });

    it("should display 5 results after adding a new book", () => {
      authors.add(NEW_AUTHOR);
      authors.shouldBeLoading();
      books.shouldBeLoading();
      authors.shouldDisplayItems(5);
    });

    it("should display new author", () => {
      authors.shouldDisplayItem(5, NEW_AUTHOR);
    });
  });

  describe("when clicks delete author", () => {
    it("should remove author", () => {
      authors.add(`${NEW_AUTHOR}-2`);
      authors.shouldDisplayItems(6);
      authors.delete(6);
      authors.shouldBeLoading();
      books.shouldBeLoading();
      authors.shouldDisplayItems(5);
    });
  });

  describe("authors search", () => {
    it("should display no results when no book is found", () => {
      authors.search.type("Foo");
      cy.wait(1000);
      authors.search.shouldDisplayNoResults();
    });

    it("should display found authors", () => {
      authors.search.type("G");
      authors.search.shouldDisplayItems(2);
    });

    it("should display new authors matching search", () => {
      authors.add(NEW_AUTHOR_2);
      authors.search.shouldBeLoading();
      cy.wait(1000);
      authors.search.shouldDisplayItems(3);
    });

    it("should refresh search results when one author is removed", () => {
      authors.delete(6);
      authors.search.shouldBeLoading();
      authors.search.shouldDisplayItems(2);
    });
  });

  describe("books column", () => {
    it("should display 5 results", () => {
      books.shouldDisplayItems(5);
    });

    it("should display 6 results after adding a new book", () => {
      books.add("Don Quijote", NEW_AUTHOR);
      books.shouldBeLoading();
      books.shouldDisplayItems(6);
    });

    it("should display new book", () => {
      books.shouldDisplayItem(6, `${NEW_BOOK} ${NEW_AUTHOR}`);
    });
  });

  describe("when clicks delete book", () => {
    it("should remove book", () => {
      books.add("Novelas Ejemplares", NEW_AUTHOR);
      books.shouldDisplayItems(7);
      books.delete(7);
      books.shouldBeLoading();
      authors.shouldNotBeLoading();
      books.shouldDisplayItems(6);
    });
  });

  describe("books search", () => {
    it("should display no results when no book is found", () => {
      books.search.type("Foo");
      books.search.shouldDisplayNoResults();
    });

    it("should display found books", () => {
      books.search.type("1");
      books.search.shouldDisplayItems(2);
    });

    it("should display new books matching search", () => {
      books.add(NEW_BOOK_2, NEW_AUTHOR);
      books.search.shouldBeLoading();
      cy.wait(1000);
      books.search.shouldDisplayItems(3);
    });

    it("should refresh search results when one book is removed", () => {
      books.delete(7);
      books.search.shouldBeLoading();
      books.search.shouldDisplayItems(2);
    });
  });

  describe("when deleting one author with books", () => {
    it("should remove related books", () => {
      Cypress.on("window:confirm", () => {
        return true;
      });
      authors.delete(1);
      books.shouldBeLoading();
      books.search.shouldBeLoading();
      authors.shouldBeLoading();
      authors.search.shouldBeLoading();
      authors.shouldDisplayItems(4);
      books.shouldDisplayItems(4);
      authors.search.shouldDisplayItems(1);
      books.search.shouldDisplayItems(1);
    });
  });
});