import { useDataLoadedError } from "@data-provider/react";

import { authorsProvider } from "data/authors";
import AuthorsList from "modules/authors-list";
import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";

const AuthorsLoaded = () => {
  const [authors, loaded] = useDataLoadedError(authorsProvider);

  console.log("Rendering authors loaded", loaded, authors);

  return (
    <SectionContainer loading={!loaded} id="authors-loaded-column">
      <ItemsTitle title="Authors without loading" />
      <ItemsListContainer id="authors-loaded-container">
        <AuthorsList authors={authors} />
      </ItemsListContainer>
    </SectionContainer>
  );
};

export default AuthorsLoaded;
