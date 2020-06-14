/* eslint-disable react/prop-types, react/display-name */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { providers } from "@data-provider/core";

import { useData, useLoading, useLoaded, useError, useDataProvider } from "../src";

import MockProvider from "./MockProvider";
import { BOOKS, BOOKS_ID, LOADING_ID, ERROR_ID } from "./constants";
import Books from "./Books";
import ReduxProvider from "./ReduxProvider";

const wait = (time = 600) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};

describe("hooks", () => {
  let provider, BooksComponent, Component;

  beforeEach(() => {
    provider = new MockProvider(BOOKS_ID, {
      data: BOOKS,
    });
  });

  afterEach(() => {
    providers.clear();
  });

  describe("useData", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const books = useData(provider);
        return <Books books={books} />;
      };

      Component = () => (
        <ReduxProvider>
          <BooksComponent />
        </ReduxProvider>
      );
    });

    it("should pass data to the component", async () => {
      const bookTitle = "Animal Farm";
      render(<Component />);
      await wait();
      expect(screen.getByText(bookTitle)).toBeInTheDocument();
    });

    it("should refresh data", async () => {
      const TEST_ID = "book-2";
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(TEST_ID)).toBeInTheDocument();
      provider.delete(2);
      await wait();
      expect(screen.queryByTestId(TEST_ID)).not.toBeInTheDocument();
    });

    it("should do nothing if no provider is provided", async () => {
      BooksComponent = () => {
        const books = useData();
        return <Books books={books} />;
      };

      Component = () => (
        <ReduxProvider>
          <BooksComponent />
        </ReduxProvider>
      );
      render(<Component />);
      expect(screen.queryByTestId(BOOKS_ID)).toBeInTheDocument();
    });
  });

  describe("useLoading", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const loading = useLoading(provider);
        return <Books loading={loading} />;
      };

      Component = () => (
        <ReduxProvider>
          <BooksComponent />
        </ReduxProvider>
      );
    });

    it("should be true when provider is loading and false when finish", async () => {
      render(<Component />);
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
    });

    it("should change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
    });
  });

  describe("useLoaded", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const loaded = useLoaded(provider);
        return <Books loading={loaded} />;
      };

      Component = () => (
        <ReduxProvider>
          <BooksComponent />
        </ReduxProvider>
      );
    });

    it("should be false when provider is loading and true when finish", async () => {
      render(<Component />);
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
    });

    it("should not change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
    });

    it("should change when provider state is reset", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      provider.resetState();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
    });
  });

  describe("useError", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const error = useError(provider);
        return <Books error={error} />;
      };

      Component = () => (
        <ReduxProvider>
          <BooksComponent />
        </ReduxProvider>
      );
    });

    it("should be null when provider does not throw error", async () => {
      render(<Component />);
      expect(screen.queryByTestId(ERROR_ID)).not.toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(ERROR_ID)).not.toBeInTheDocument();
    });

    it("should return error when provider throws error", async () => {
      const ERROR_MESSAGE = "Foo error";
      provider.error = new Error(ERROR_MESSAGE);
      render(<Component />);
      await wait();
      expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
    });
  });

  describe("useDataProvider", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const [books, loading, error] = useDataProvider(provider);
        return <Books error={error} books={books} loading={loading} />;
      };

      Component = () => (
        <ReduxProvider>
          <BooksComponent />
        </ReduxProvider>
      );
    });

    it("loading should be true when provider is loading and false when finish", async () => {
      render(<Component />);
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
    });

    it("loading should change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
    });

    it("should pass data to the component", async () => {
      const bookTitle = "Animal Farm";
      render(<Component />);
      await wait();
      expect(screen.getByText(bookTitle)).toBeInTheDocument();
    });

    it("should refresh data", async () => {
      const TEST_ID = "book-2";
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(TEST_ID)).toBeInTheDocument();
      provider.delete(2);
      await wait();
      expect(screen.queryByTestId(TEST_ID)).not.toBeInTheDocument();
    });

    it("error should be null when provider does not throw error", async () => {
      render(<Component />);
      expect(screen.queryByTestId(ERROR_ID)).not.toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(ERROR_ID)).not.toBeInTheDocument();
    });

    it("should return error when provider throws error", async () => {
      const ERROR_MESSAGE = "Foo error";
      provider.error = new Error(ERROR_MESSAGE);
      render(<Component />);
      await wait();
      expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
    });
  });
});
