import React, { useState, useCallback } from "react";

import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";

import AuthorsSearchResults from "./modules/authors-search-results";

const AuthorsSearch = () => {
  const [search, changeSearch] = useState("");
  const handleChange = useCallback(e => {
    changeSearch(e.target.value);
  });

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
      <AuthorsSearchResults search={search} />
    </SectionContainer>
  );
};

export default AuthorsSearch;
