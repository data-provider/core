import { useMemo, memo } from "react";
import Proptypes from "prop-types";

import { useRefresh, useData, useLoading } from "@data-provider/react";

import { authorsSearch } from "data/authors";
import AuthorsList from "modules/authors-list";
import ItemsListContainer from "components/items-list-container";
import Loading from "components/loading";
import NoResults from "components/no-results";

const AuthorsSearchResults = ({ search }) => {
  const provider = useMemo(() => {
    return authorsSearch.query({ search });
  }, [search]);
  useRefresh(provider);
  const authors = useData(provider);
  const loading = useLoading(provider);

  console.log("Rendering authors search results", loading, authors);
  const hasNotResults = !loading && authors.length < 1 && search.length > 1;
  return (
    <ItemsListContainer id="authors-search-container">
      {loading && <Loading />}
      {hasNotResults && <NoResults />}
      <AuthorsList authors={authors} />
    </ItemsListContainer>
  );
};

AuthorsSearchResults.propTypes = {
  search: Proptypes.string,
};

export default memo(AuthorsSearchResults);
