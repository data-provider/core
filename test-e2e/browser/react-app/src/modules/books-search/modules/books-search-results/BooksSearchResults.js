import React, { memo } from "react";
import Proptypes from "prop-types";

import { booksSearch } from "data/books";

import BooksList from "modules/books-list";
import ItemsListContainer from "components/items-list-container";
import Loading from "components/loading";
import NoResults from "components/no-results";
import { withData, withLoading, withRefresh } from "helpers/data-provider";

const queryBooks = search => booksSearch.query({ search });

const ConnectedBooks = withRefresh(queryBooks)(withData(queryBooks, "books")(BooksList));

const BooksSearchResults = ({ search, books, loading }) => {
  console.log("Rendering books search results", loading, books);

  const hasNotResults = !loading && books.length < 1 && search.length > 1;
  return (
    <ItemsListContainer id="books-search-container">
      {loading && <Loading />}
      {hasNotResults && <NoResults />}
      <ConnectedBooks query={search} />
    </ItemsListContainer>
  );
};

BooksSearchResults.propTypes = {
  search: Proptypes.string,
  books: Proptypes.array,
  loading: Proptypes.bool
};

const BooksSearchResultsConnected = withRefresh(queryBooks)(
  withLoading(queryBooks)(withData(queryBooks, "books")(BooksSearchResults))
);

export default memo(BooksSearchResultsConnected);
