/* eslint-disable react/prop-types, react/display-name */

import React, { useState, useEffect } from "react";
import "@testing-library/jest-dom";
import { render, act } from "@testing-library/react";
import { providers, Selector } from "@data-provider/core";
import sinon from "sinon";

import { withPolling, useData } from "../src";

import MockProvider from "./MockProvider";
import { BOOKS, BOOKS_ID } from "./constants";
import Books from "./Books";
import ReduxProvider from "./ReduxProvider";

const wait = (time = 600) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
};

describe("withPolling", () => {
  let sandbox, provider, BooksComponent, BooksComponentToRender, Component, selector;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    provider = new MockProvider({
      id: BOOKS_ID,
      data: BOOKS,
    });
    selector = new Selector(provider, (result) => result);
    sandbox.spy(provider, "cleanCache");
  });

  afterEach(() => {
    providers.clear();
    sandbox.restore();
  });

  it("should wrap displayName of the component", async () => {
    BooksComponent = () => {
      return <Books books={[]} />;
    };

    BooksComponentToRender = withPolling(null, 500)(BooksComponent);
    expect(BooksComponentToRender.displayName).toEqual("WithPollingBooksComponent");
  });

  describe("when no provider is defined", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const books = useData(provider);
        return <Books books={books} />;
      };

      BooksComponentToRender = withPolling(null, 500)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksComponentToRender />
        </ReduxProvider>
      );
    });

    it("should do nothing", async () => {
      render(<Component />);
      await wait(2000);
      expect(provider.cleanCache.callCount).toEqual(0);
    });
  });

  describe("when used alone", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const books = useData(provider);
        return <Books books={books} />;
      };

      BooksComponentToRender = withPolling(provider, 500)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksComponentToRender />
        </ReduxProvider>
      );
    });

    it("should clean provider cache each 500ms", async () => {
      render(<Component />);
      await wait(2200);
      expect(provider.cleanCache.callCount).toEqual(4);
    });
  });

  describe("when many components are use polling for same provider", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const books = useData(provider);
        return <Books books={books} />;
      };

      BooksComponentToRender = withPolling(provider, 500)(BooksComponent);
      const BooksComponentToRender2 = withPolling(provider, 1000)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksComponentToRender />
          <BooksComponentToRender2 />
        </ReduxProvider>
      );
    });

    it("should use the lower polling interval", async () => {
      render(<Component />);
      await wait(2200);
      expect(provider.cleanCache.callCount).toEqual(4);
    });
  });

  describe("when a component use polling is removed", () => {
    beforeEach(() => {
      BooksComponent = () => {
        const books = useData(provider);
        return <Books books={books} />;
      };

      BooksComponentToRender = withPolling(provider, 1000)(BooksComponent);
      const BooksComponentToRender2 = withPolling(provider, 500)(BooksComponent);

      Component = () => {
        const [showSecondary, setShowSecondary] = useState(true);
        useEffect(() => {
          const timeOut = setTimeout(() => {
            setShowSecondary(false);
          }, 1200);
          return () => {
            clearTimeout(timeOut);
          };
        }, []);
        return (
          <ReduxProvider>
            <BooksComponentToRender />
            {showSecondary && <BooksComponentToRender2 />}
          </ReduxProvider>
        );
      };
    });

    it("should use the next lower polling interval available from the rest of components using it", async () => {
      render(<Component />);
      const promise = wait(3200);
      await act(() => promise);
      expect(provider.cleanCache.callCount).toEqual(3);
    });
  });

  describe("when using except option", () => {
    beforeEach(() => {
      const OPTIONS = {
        except: [provider],
      };
      BooksComponent = () => {
        const books = useData(selector);
        return <Books books={books} />;
      };

      BooksComponentToRender = withPolling(selector, 500, OPTIONS)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksComponentToRender />
        </ReduxProvider>
      );
    });

    it("should not clean the provider cache as it is defined in except option", async () => {
      render(<Component />);
      await wait(3000);
      expect(provider.cleanCache.callCount).toEqual(0);
    });
  });

  describe("when using options as first argument", () => {
    beforeEach(() => {
      const OPTIONS = {
        except: [provider],
      };
      BooksComponent = () => {
        const books = useData(selector);
        return <Books books={books} />;
      };

      BooksComponentToRender = withPolling(selector, OPTIONS)(BooksComponent);

      Component = () => (
        <ReduxProvider>
          <BooksComponent />
        </ReduxProvider>
      );
    });

    it("should not clean the provider cache as it is defined in except option", async () => {
      render(<Component />);
      await wait(8000);
      expect(provider.cleanCache.callCount).toEqual(0);
    }, 10000);
  });
});
