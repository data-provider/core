import React, { useMemo, memo } from "react";
import Proptypes from "prop-types";

import { booksSearch } from "data/books";

import BooksList from "modules/books-list";
import ItemsListContainer from "components/items-list-container";
import Loading from "components/loading";
import NoResults from "components/no-results";
import { useRefresh, useData, useLoading } from "helpers/data-provider";

const BooksSearchResults = ({ search }) => {
  const provider = useMemo(() => {
    return booksSearch.query({ search });
  }, [search]);
  useRefresh(provider);
  const books = useData(provider);
  const loading = useLoading(provider);

  console.log("Rendering books search results", loading, books);

  const hasNotResults = !loading && books.length < 1 && search.length > 1;
  return (
    <ItemsListContainer id="books-search-container">
      {loading && <Loading />}
      {hasNotResults && <NoResults />}
      <BooksList books={books} />
    </ItemsListContainer>
  );
};

BooksSearchResults.propTypes = {
  search: Proptypes.string
};

export default memo(BooksSearchResults);
