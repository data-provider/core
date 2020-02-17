import React from "react";

import { authorsProvider } from "data/authors";
import { deleteAuthorAndBooks } from "data/books";

import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";
import DeleteIcon from "components/delete-icon";
import Author from "components/author";
import { useRefresh, useData, useLoading } from "helpers/data-provider";

const Authors = () => {
  useRefresh(authorsProvider);
  const authors = useData(authorsProvider);
  const loading = useLoading(authorsProvider);

  console.log("Rendering authors", loading, authors);

  return (
    <SectionContainer loading={loading} id="authors-column">
      <ItemsTitle title="Authors" />
      <ItemsListContainer id="authors-container">
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
    </SectionContainer>
  );
};

export default Authors;
