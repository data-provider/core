/* eslint-disable react/prop-types, react/display-name */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { providers } from "@data-provider/core";
import sinon from "sinon";

import { withDataProvider, withDataProviderBranch } from "../src";

import MockProvider from "./MockProvider";
import { BOOKS, BOOKS_ID, LOADING_ID, ERROR_ID } from "./constants";
import Books from "./Books";
import ReduxProvider from "./ReduxProvider";

const wait = (time = 600) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};

describe("HOCs deprecated", () => {
  let provider, BooksComponent, BooksConnectedComponent, Component, sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new MockProvider({
      id: BOOKS_ID,
      data: BOOKS,
    });
    sandbox.spy(console, "warn");
  });

  afterEach(() => {
    providers.clear();
    sandbox.restore();
  });

  describe("withDataProvider", () => {
    beforeEach(() => {
      BooksComponent = ({ data, loading, error }) => {
        return <Books error={error} books={data} loading={loading} />;
      };

      BooksComponent.fooProperty = "foo";

      BooksConnectedComponent = withDataProvider(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should have available statics of the component", async () => {
      expect(BooksConnectedComponent.fooProperty).toEqual("foo");
    });

    it("should have logged a deprecation warning", async () => {
      render(<Component />);
      expect(
        console.warn.calledWith(
          '@data-provider/react: "withDataProvider" is deprecated. Please use "withDataLoadingError" instead.'
        )
      ).toEqual(true);
    });

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual("WithDataLoadingErrorBooksComponent");
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

  describe("withDataProvider using custom props", () => {
    beforeEach(() => {
      BooksComponent = ({ books, booksAreLoading, booksError }) => {
        return <Books error={booksError} books={books} loading={booksAreLoading} />;
      };

      BooksConnectedComponent = withDataProvider(provider, [
        "books",
        "booksAreLoading",
        "booksError",
      ])(BooksComponent);

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

    it("should pass data to the component", async () => {
      const bookTitle = "Animal Farm";
      render(<Component />);
      await wait();
      expect(screen.getByText(bookTitle)).toBeInTheDocument();
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

  describe("withDataProvider using data custom prop", () => {
    beforeEach(() => {
      BooksComponent = ({ books, loading, error }) => {
        return <Books error={error} books={books} loading={loading} />;
      };

      BooksConnectedComponent = withDataProvider(provider, ["books"])(BooksComponent);

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

    it("should pass data to the component", async () => {
      const bookTitle = "Animal Farm";
      render(<Component />);
      await wait();
      expect(screen.getByText(bookTitle)).toBeInTheDocument();
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

  describe("withDataProviderBranch", () => {
    const CUSTOM_LOADING_ID = `${LOADING_ID}-custom`;
    const CUSTOM_ERROR_ID = `${ERROR_ID}-custom`;
    let CustomLoadingComponent, CustomErrorComponent;

    beforeEach(() => {
      CustomLoadingComponent = ({ loading }) => {
        if (!loading) {
          return null;
        }
        return <div data-testid={CUSTOM_LOADING_ID}>Loading</div>;
      };

      CustomErrorComponent = ({ error = {} }) => {
        return <div data-testid={CUSTOM_ERROR_ID}>{error.message}</div>;
      };

      BooksComponent = ({ data }) => {
        return <Books books={data} />;
      };

      BooksComponent.fooProperty = "foo";

      BooksConnectedComponent = withDataProviderBranch(provider)(
        BooksComponent,
        CustomLoadingComponent,
        CustomErrorComponent
      );

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should have available statics of the component", async () => {
      expect(BooksConnectedComponent.fooProperty).toEqual("foo");
    });

    it("should have logged a deprecation warning", async () => {
      render(<Component />);
      expect(
        console.warn.calledWith(
          '@data-provider/react: "withDataProviderBranch" is deprecated. Please use "withDataLoadingErrorComponents" instead.'
        )
      ).toEqual(true);
    });

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual(
        "WithDataLoadingErrorComponentsBooksComponent"
      );
    });

    it("loading should be true when provider is loading and false when finish", async () => {
      render(<Component />);
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
    });

    it("loading should change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
    });

    it("should return null when provider is loading and no loading component is provided", async () => {
      BooksConnectedComponent = withDataProviderBranch(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
      render(<Component />);
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(BOOKS_ID)).not.toBeInTheDocument();
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
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
    });

    it("should return error when provider throws error", async () => {
      const ERROR_MESSAGE = "Foo error";
      provider.error = new Error(ERROR_MESSAGE);
      render(<Component />);
      await wait();
      expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
    });

    it("should return null when provider throws an error and no error component is provided", async () => {
      BooksConnectedComponent = withDataProviderBranch(provider)(
        BooksComponent,
        CustomLoadingComponent
      );

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
      provider.error = new Error();
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(BOOKS_ID)).not.toBeInTheDocument();
    });
  });

  describe("withDataProviderBranch using custom prop", () => {
    const CUSTOM_LOADING_ID = `${LOADING_ID}-custom`;
    const CUSTOM_ERROR_ID = `${ERROR_ID}-custom`;
    let CustomLoadingComponent, CustomErrorComponent;

    beforeEach(() => {
      CustomLoadingComponent = ({ booksAreLoading }) => {
        if (!booksAreLoading) {
          return null;
        }
        return <div data-testid={CUSTOM_LOADING_ID}>Loading</div>;
      };

      CustomErrorComponent = ({ booksError = {} }) => {
        return <div data-testid={CUSTOM_ERROR_ID}>{booksError.message}</div>;
      };

      BooksConnectedComponent = withDataProviderBranch(provider, [
        "books",
        "booksAreLoading",
        "booksError",
      ])(Books, CustomLoadingComponent, CustomErrorComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("loading should be true when provider is loading and false when finish", async () => {
      render(<Component />);
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
    });

    it("loading should change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
    });

    it("should return null when provider is loading and no loading component is provided", async () => {
      BooksConnectedComponent = withDataProviderBranch(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
      render(<Component />);
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(BOOKS_ID)).not.toBeInTheDocument();
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
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
    });

    it("should return error when provider throws error", async () => {
      const ERROR_MESSAGE = "Foo error";
      provider.error = new Error(ERROR_MESSAGE);
      render(<Component />);
      await wait();
      expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
    });

    it("should return null when provider throws an error and no error component is provided", async () => {
      BooksConnectedComponent = withDataProviderBranch(provider)(
        BooksComponent,
        CustomLoadingComponent
      );

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
      provider.error = new Error();
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(CUSTOM_ERROR_ID)).not.toBeInTheDocument();
      expect(screen.queryByTestId(BOOKS_ID)).not.toBeInTheDocument();
    });
  });
});
