import React from "react";

import { authorsProvider } from "data/authors";

import AuthorsList from "modules/authors-list";
import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";
import Placeholders from "components/placeholders";
import { useRefresh, useData, useLoading, useLoaded } from "helpers/data-provider";

import AuthorNew from "./modules/author-new";

const Authors = () => {
  useRefresh(authorsProvider);
  const authors = useData(authorsProvider);
  const loading = useLoading(authorsProvider);
  const loaded = useLoaded(authorsProvider);

  console.log("Rendering authors", loading, authors);

  return (
    <SectionContainer loading={loading} id="authors-column">
      <ItemsTitle title="Authors" />
      {loaded ? (
        <ItemsListContainer id="authors-container">
          <AuthorsList authors={authors} />
        </ItemsListContainer>
      ) : (
        <Placeholders id="authors-placeholder" />
      )}
      <AuthorNew />
    </SectionContainer>
  );
};

export default Authors;
