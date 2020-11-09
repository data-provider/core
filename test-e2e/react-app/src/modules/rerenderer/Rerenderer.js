import { useState, useCallback } from "react";

import { booksWithAuthorName } from "data/books";
import BooksSearch from "modules/books-search";
import BooksList from "modules/books-list";

import {
  withDataLoadingErrorComponents,
  withDataLoadingError,
  withData,
  withLoading,
} from "helpers/data-provider";

import Loading from "./Loading";
import Wrapper from "./Wrapper";

const BooksListConnected = withDataLoadingErrorComponents(booksWithAuthorName, [
  "books",
  "isLoading",
])(BooksList, Loading);

const WrapperConnected = withDataLoadingError(booksWithAuthorName, ["books", "isLoading"])(
  Wrapper
);
const WrapperConnectedToDataAndLoading = withLoading(
  booksWithAuthorName,
  "isLoading"
)(withData(booksWithAuthorName, "books")(Wrapper));

const BooksSearchRerendered = () => {
  const [currentRenders, changeCurrentRenders] = useState(0);
  const rerender = useCallback(() => changeCurrentRenders((state) => state + 1), []);

  console.log("Rerendering");

  return (
    <div id="books-search-rerendered">
      <div>
        <button onClick={rerender}>Force rerender</button> {currentRenders}
      </div>
      <div>
        <BooksSearch />
      </div>
      <div>
        <BooksListConnected />
      </div>
      <div>
        <WrapperConnected />
      </div>
      <div>
        <WrapperConnectedToDataAndLoading />
      </div>
    </div>
  );
};

export default BooksSearchRerendered;
