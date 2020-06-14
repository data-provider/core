import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { providers } from "@data-provider/core";

import { useData } from "../src";

import MockProvider from "./MockProvider";
import { BOOKS } from "./constants";
import Books from "./Books";
import ReduxProvider from "./ReduxProvider";

const wait = (time = 600) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};

describe("hooks", () => {
  let provider;

  beforeEach(() => {
    provider = new MockProvider("books", {
      data: BOOKS,
    });
  });

  afterEach(() => {
    providers.clear();
  });

  describe("useData", () => {
    const BooksComponent = () => {
      const books = useData(provider);
      return <Books books={books} />;
    };

    const Component = () => (
      <ReduxProvider>
        <BooksComponent />
      </ReduxProvider>
    );

    it("should pass data to the component", async () => {
      const bookTitle = "Animal Farm";
      render(<Component />);
      await wait();
      expect(screen.getByText(bookTitle)).toBeInTheDocument();
    });

    it("should refresh data", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId("book-2")).toBeInTheDocument();
      provider.delete(2);
      await wait();
      expect(screen.queryByTestId("book-2")).not.toBeInTheDocument();
    });
  });
});
