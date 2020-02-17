import React from "react";
import Proptypes from "prop-types";

import { authorsSearch } from "data/authors";
import { deleteAuthorAndBooks } from "data/books";

import ItemsListContainer from "components/items-list-container";
import DeleteIcon from "components/delete-icon";
import Author from "components/author";
import { useRefresh, useData, useLoading } from "helpers/data-provider";

const BooksSearchResults = ({ search }) => {
  console.log(search);
  useRefresh(authorsSearch.query({ search }), [search]);
  const authors = useData(authorsSearch.query({ search }));
  const loading = useLoading(authorsSearch.query({ search }));

  console.log("Rendering authors search results", loading, authors);

  return (
    <ItemsListContainer id="authors-search-container">
      {authors.map(author => {
        const deleteIcon = (
          <DeleteIcon
            onClick={() => {
              deleteAuthorAndBooks(author.id);
            }}
          />
        );
        return (
          <Author id={author.id} name={author.name} key={author.id} deleteIcon={deleteIcon} />
        );
      })}
    </ItemsListContainer>
  );
};

BooksSearchResults.propTypes = {
  search: Proptypes.string
};

export default BooksSearchResults;
