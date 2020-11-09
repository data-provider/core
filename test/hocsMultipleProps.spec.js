/* eslint-disable react/prop-types, react/display-name */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { providers } from "@data-provider/core";
import sinon from "sinon";

import {
  withDataLoadedError,
  withDataLoadingError,
  withDataLoadingErrorComponents,
  withDataLoadedErrorComponents,
} from "../src";

import MockProvider from "./MockProvider";
import { BOOKS, BOOKS_ID, LOADING_ID, ERROR_ID } from "./constants";
import Books from "./Books";
import ReduxProvider from "./ReduxProvider";

const wait = (time = 600) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};

describe("HOCs providing multiple props", () => {
  let provider, BooksComponent, BooksConnectedComponent, Component, sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new MockProvider(BOOKS_ID, {
      data: BOOKS,
    });
  });

  afterEach(() => {
    providers.clear();
    sandbox.restore();
  });

  describe("withDataLoadedError", () => {
    beforeEach(() => {
      provider.resetState();
      provider.cleanCache();
      BooksComponent = ({ data, loaded, error }) => {
        return <Books error={error} books={data} loading={!loaded} />;
      };

      BooksConnectedComponent = withDataLoadedError(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual("WithDataLoadedErrorBooksComponent");
    });

    it("loading should be true when provider is loading first time and false when finish", async () => {
      render(<Component />);
      expect(screen.queryByTestId(LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
    });

    it("loading should not change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(LOADING_ID)).not.toBeInTheDocument();
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

  describe("withDataLoadedError using custom props", () => {
    beforeEach(() => {
      provider.resetState();
      provider.cleanCache();
      BooksComponent = ({ books, booksAreLoaded, booksError }) => {
        return <Books error={booksError} books={books} loading={!booksAreLoaded} />;
      };

      BooksConnectedComponent = withDataLoadedError(provider, [
        "books",
        "booksAreLoaded",
        "booksError",
      ])(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("loading should be true when provider is loading first time and false when finish", async () => {
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

  describe("withDataLoadedError using data custom prop", () => {
    beforeEach(() => {
      provider.resetState();
      provider.cleanCache();
      BooksComponent = ({ books, loaded, error }) => {
        return <Books error={error} books={books} loading={!loaded} />;
      };

      BooksConnectedComponent = withDataLoadedError(provider, ["books"])(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("loading should be true when provider is loading first time and false when finish", async () => {
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

  describe("withDataLoadingError", () => {
    beforeEach(() => {
      BooksComponent = ({ data, loading, error }) => {
        return <Books error={error} books={data} loading={loading} />;
      };

      BooksConnectedComponent = withDataLoadingError(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
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

  describe("withDataLoadingError using custom props", () => {
    beforeEach(() => {
      BooksComponent = ({ books, booksAreLoading, booksError }) => {
        return <Books error={booksError} books={books} loading={booksAreLoading} />;
      };

      BooksConnectedComponent = withDataLoadingError(provider, [
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

  describe("withDataLoadingError using data custom prop", () => {
    beforeEach(() => {
      BooksComponent = ({ books, loading, error }) => {
        return <Books error={error} books={books} loading={loading} />;
      };

      BooksConnectedComponent = withDataLoadingError(provider, ["books"])(BooksComponent);

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

  describe("withDataLoadingErrorComponents", () => {
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

      BooksConnectedComponent = withDataLoadingErrorComponents(provider)(
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
      BooksConnectedComponent = withDataLoadingErrorComponents(provider)(BooksComponent);

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
      BooksConnectedComponent = withDataLoadingErrorComponents(provider)(
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

  describe("withDataLoadingErrorComponents using custom prop", () => {
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

      BooksConnectedComponent = withDataLoadingErrorComponents(provider, [
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
      BooksConnectedComponent = withDataLoadingErrorComponents(provider)(BooksComponent);

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
      BooksConnectedComponent = withDataLoadingErrorComponents(provider)(
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

  describe("withDataLoadedErrorComponents", () => {
    const CUSTOM_LOADING_ID = `${LOADING_ID}-custom`;
    const CUSTOM_ERROR_ID = `${ERROR_ID}-custom`;
    let CustomLoadingComponent, CustomErrorComponent;

    beforeEach(() => {
      provider.resetState();
      provider.cleanCache();
      CustomLoadingComponent = ({ loaded }) => {
        if (loaded) {
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

      BooksConnectedComponent = withDataLoadedErrorComponents(provider)(
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

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual(
        "WithDataLoadedErrorComponentsBooksComponent"
      );
    });

    it("loading should be true when provider is loading first time and false when finish", async () => {
      render(<Component />);
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
    });

    it("loading should not change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
    });

    it("should return null when provider is loading and no loading component is provided", async () => {
      BooksConnectedComponent = withDataLoadedErrorComponents(provider)(BooksComponent);

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
      BooksConnectedComponent = withDataLoadedErrorComponents(provider)(
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

  describe("withDataLoadedErrorComponents using custom prop", () => {
    const CUSTOM_LOADING_ID = `${LOADING_ID}-custom`;
    const CUSTOM_ERROR_ID = `${ERROR_ID}-custom`;
    let CustomLoadingComponent, CustomErrorComponent;

    beforeEach(() => {
      provider = new MockProvider(BOOKS_ID, {
        data: BOOKS,
      });
      CustomLoadingComponent = ({ booksAreLoaded }) => {
        if (booksAreLoaded) {
          return null;
        }
        return <div data-testid={CUSTOM_LOADING_ID}>Loading</div>;
      };

      CustomErrorComponent = ({ booksError = {} }) => {
        return <div data-testid={CUSTOM_ERROR_ID}>{booksError.message}</div>;
      };

      BooksConnectedComponent = withDataLoadedErrorComponents(provider, [
        "books",
        "booksAreLoaded",
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

    it("loading should not change when provider cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      provider.cleanCache();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
      await wait();
      expect(screen.queryByTestId(CUSTOM_LOADING_ID)).not.toBeInTheDocument();
    });

    it("should return null when provider is loading and no loading component is provided", async () => {
      BooksConnectedComponent = withDataLoadedErrorComponents(provider)(BooksComponent);

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
      BooksConnectedComponent = withDataLoadedErrorComponents(provider)(
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
