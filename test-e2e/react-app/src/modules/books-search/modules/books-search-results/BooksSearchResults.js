import React, { memo } from "react";
import Proptypes from "prop-types";

import { withData, withLoading } from "@data-provider/react";

import { booksSearch } from "data/books";
import BooksList from "modules/books-list";
import ItemsListContainer from "components/items-list-container";
import Loading from "components/loading";
import NoResults from "components/no-results";

const queryBooks = ({ search }) => booksSearch.query({ search });

const ConnectedBooks = withData(queryBooks, "books")(BooksList);

const BooksSearchResults = ({ search, books, loading }) => {
  console.log("Rendering books search results", loading, books);

  const hasNotResults = !loading && books.length < 1 && search.length > 1;
  return (
    <ItemsListContainer id="books-search-container">
      {loading && <Loading />}
      {hasNotResults && <NoResults />}
      <ConnectedBooks search={search} />
    </ItemsListContainer>
  );
};

BooksSearchResults.propTypes = {
  search: Proptypes.string,
  books: Proptypes.array,
  loading: Proptypes.bool
};

const BooksSearchResultsConnected = withLoading(queryBooks)(
  withData(queryBooks, "books")(BooksSearchResults)
);

export default memo(BooksSearchResultsConnected);
