import React, { useState, useCallback } from "react";

import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";

import BooksSearchResults from "./modules/books-search-results";

const BooksSearch = () => {
  const [search, changeSearch] = useState("");
  const handleChange = useCallback(e => {
    changeSearch(e.target.value);
  });

  return (
    <SectionContainer id="books-search">
      <ItemsTitle title="Books Search" />
      <input
        type="text"
        id="search-book"
        value={search}
        placeholder="Type to search"
        onChange={handleChange}
      />
      <BooksSearchResults search={search} />
    </SectionContainer>
  );
};

export default BooksSearch;
