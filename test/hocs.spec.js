import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { providers } from "@data-provider/core";

import { withData, withLoading, withLoaded, withError, withDataProvider } from "../src";

import MockProvider from "./MockProvider";
import { BOOKS, BOOKS_ID, LOADING_ID, ERROR_ID } from "./constants";
import Books from "./Books";
import ReduxProvider from "./ReduxProvider";

const wait = (time = 600) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};

describe("HOCs", () => {
  let provider, BooksComponent, BooksConnectedComponent, Component;

  beforeEach(() => {
    provider = new MockProvider(BOOKS_ID, {
      data: BOOKS,
    });
  });

  afterEach(() => {
    providers.clear();
  });

  describe("withData", () => {
    beforeEach(() => {
      // eslint-disable-next-line
      BooksComponent = ({ data }) => {
        return <Books books={data} />;
      };

      BooksConnectedComponent = withData(provider)(BooksComponent);

      // eslint-disable-next-line
      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
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
      // eslint-disable-next-line
      BooksComponent = ({ data }) => {
        return <Books books={data} />;
      };

      BooksConnectedComponent = withData()(BooksComponent);

      // eslint-disable-next-line
      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
      render(<Component />);
      expect(screen.queryByTestId(BOOKS_ID)).toBeInTheDocument();
    });
  });

  describe("withLoading", () => {
    beforeEach(() => {
      // eslint-disable-next-line
      BooksComponent = ({ loading }) => {
        return <Books loading={loading} />;
      };

      BooksConnectedComponent = withLoading(provider)(BooksComponent);

      // eslint-disable-next-line
      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
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

  describe("withLoaded", () => {
    beforeEach(() => {
      // eslint-disable-next-line
      BooksComponent = ({ loaded }) => {
        return <Books loading={loaded} />;
      };

      BooksConnectedComponent = withLoaded(provider)(BooksComponent);

      // eslint-disable-next-line
      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
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

  describe("withError", () => {
    beforeEach(() => {
      // eslint-disable-next-line
      BooksComponent = ({ error }) => {
        return <Books error={error} />;
      };

      BooksConnectedComponent = withError(provider)(BooksComponent);

      // eslint-disable-next-line
      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
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
      // eslint-disable-next-line
      BooksComponent = ({ data, loading, error }) => {
        return <Books error={error} books={data} loading={loading} />;
      };

      BooksConnectedComponent = withDataProvider(provider)(BooksComponent);

      // eslint-disable-next-line
      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
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
