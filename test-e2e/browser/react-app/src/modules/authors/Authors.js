import React from "react";

import { authorsProvider } from "data/authors";

import AuthorsList from "modules/authors-list";
import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";
import { useRefresh, useData, useLoading } from "helpers/data-provider";

import AuthorNew from "./modules/author-new";

const Authors = () => {
  useRefresh(authorsProvider);
  const authors = useData(authorsProvider);
  const loading = useLoading(authorsProvider);

  console.log("Rendering authors", loading, authors);

  return (
    <SectionContainer loading={loading} id="authors-column">
      <ItemsTitle title="Authors" />
      <ItemsListContainer id="authors-container">
        <AuthorsList authors={authors} />
      </ItemsListContainer>
      <AuthorNew />
    </SectionContainer>
  );
};

export default Authors;