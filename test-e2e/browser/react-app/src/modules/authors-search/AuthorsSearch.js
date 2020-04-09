import React, { useState, useCallback, useMemo } from "react";

import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import { debounce } from "helpers/debounce";

import AuthorsSearchResults from "./modules/authors-search-results";

const AuthorsSearch = () => {
  const [search, changeSearch] = useState("");
  const [currentSearch, changeCurrentSearch] = useState("");
  const triggerChangeCurrentSearch = useMemo(() => {
    return debounce(changeCurrentSearch, 50);
  }, []);
  const handleChange = useCallback(
    (e) => {
      changeSearch(e.target.value);
      triggerChangeCurrentSearch(e.target.value);
    },
    [triggerChangeCurrentSearch]
  );

  return (
    <SectionContainer id="authors-search">
      <ItemsTitle title="Authors Search" />
      <input
        type="text"
        id="search-author"
        value={search}
        placeholder="Type to search"
        onChange={handleChange}
      />
      <AuthorsSearchResults search={currentSearch} />
    </SectionContainer>
  );
};

export default AuthorsSearch;
