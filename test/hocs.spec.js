/* eslint-disable react/prop-types, react/display-name */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { providers } from "@data-provider/core";
import sinon from "sinon";

import { withData, withLoading, withLoaded, withError, withRefresh } from "../src";

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

  describe("withData", () => {
    beforeEach(() => {
      BooksComponent = ({ data }) => {
        return <Books books={data} />;
      };

      BooksComponent.fooProperty = "foo";

      BooksConnectedComponent = withData(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual("WithDataBooksComponent");
    });

    it("should have available statics of the component", async () => {
      expect(BooksConnectedComponent.fooProperty).toEqual("foo");
    });

    it("should wrap displayName of the component using name property if component has not displayName", async () => {
      BooksComponent = ({ data }) => {
        return <Books books={data} />;
      };
      BooksComponent.displayName = null;
      BooksConnectedComponent = withData(provider)(BooksComponent);
      expect(BooksConnectedComponent.displayName).toEqual("WithDataBooksComponent");
    });

    it("should assign Component displayName by default if the component has not displayName nor name", async () => {
      BooksConnectedComponent = withData(provider)(function ({ data }) {
        return <Books books={data} />;
      });
      expect(BooksConnectedComponent.displayName).toEqual("WithDataComponent");
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
      BooksComponent = ({ data }) => {
        return <Books books={data} />;
      };

      BooksConnectedComponent = withData()(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
      render(<Component />);
      expect(screen.queryByTestId(BOOKS_ID)).toBeInTheDocument();
    });
  });

  describe("withData using custom prop", () => {
    beforeEach(() => {
      BooksConnectedComponent = withData(provider, "books")(Books);

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
  });

  describe("withData using function", () => {
    let componentProps;
    beforeEach(() => {
      BooksConnectedComponent = withData((props) => {
        componentProps = props;
        return provider;
      }, "books")(Books);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent foo="foo" />
        </ReduxProvider>
      );
    });

    it("should pass data to the component", async () => {
      const bookTitle = "Animal Farm";
      render(<Component />);
      await wait();
      expect(screen.getByText(bookTitle)).toBeInTheDocument();
    });

    it("should pass component properties to the function", async () => {
      render(<Component />);
      await wait();
      expect(componentProps.foo).toEqual("foo");
    });
  });

  describe("withLoading", () => {
    beforeEach(() => {
      BooksConnectedComponent = withLoading(provider)(Books);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should have available statics of the component", async () => {
      expect(BooksConnectedComponent.fooProperty).toEqual("foo");
    });

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual("WithLoadingBooks");
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

  describe("withLoading using custom prop", () => {
    beforeEach(() => {
      BooksComponent = ({ isLoading }) => {
        return <Books loading={isLoading} />;
      };

      BooksConnectedComponent = withLoading(provider, "isLoading")(BooksComponent);

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
  });

  describe("withLoaded", () => {
    beforeEach(() => {
      BooksComponent = ({ loaded }) => {
        return <Books loading={loaded} />;
      };

      BooksComponent.fooProperty = "foo";

      BooksConnectedComponent = withLoaded(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should have available statics of the component", async () => {
      expect(BooksConnectedComponent.fooProperty).toEqual("foo");
    });

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual("WithLoadedBooksComponent");
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

  describe("withLoaded using custom prop", () => {
    beforeEach(() => {
      BooksComponent = ({ hasLoaded }) => {
        return <Books loading={hasLoaded} />;
      };

      BooksConnectedComponent = withLoaded(provider, "hasLoaded")(BooksComponent);

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
  });

  describe("withError", () => {
    beforeEach(() => {
      BooksConnectedComponent = withError(provider)(Books);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should have available statics of the component", async () => {
      expect(BooksConnectedComponent.fooProperty).toEqual("foo");
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

  describe("withError using custom prop", () => {
    beforeEach(() => {
      BooksComponent = ({ booksError }) => {
        return <Books error={booksError} />;
      };

      BooksConnectedComponent = withError(provider, "booksError")(BooksComponent);

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

  describe("withRefresh", () => {
    beforeEach(() => {
      sandbox.spy(provider, "read");
      BooksComponent = () => {
        return <Books books={provider.state.data} />;
      };

      BooksComponent.fooProperty = "foo";

      BooksConnectedComponent = withRefresh(provider)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksConnectedComponent />
        </ReduxProvider>
      );
    });

    it("should have available statics of the component", async () => {
      expect(BooksConnectedComponent.fooProperty).toEqual("foo");
    });

    it("should wrap displayName of the component", async () => {
      expect(BooksConnectedComponent.displayName).toEqual("WithRefreshBooksComponent");
    });

    it("should call to read the provider each time the cache is cleaned", async () => {
      render(<Component />);
      await wait();
      expect(provider.read.callCount).toEqual(1);
      provider.delete(2);
      await wait();
      expect(provider.read.callCount).toEqual(2);
    });
  });
});
