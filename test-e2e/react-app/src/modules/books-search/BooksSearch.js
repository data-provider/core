import React, { useState, useCallback, useMemo, memo } from "react";

import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import { debounce } from "helpers/debounce";

import BooksSearchResults from "./modules/books-search-results";

const BooksSearch = () => {
  const [search, changeSearch] = useState("");
  const [currentSearch, changeCurrentSearch] = useState("");
  const triggerChangeCurrentSearch = useMemo(() => {
    return debounce(changeCurrentSearch, 50);
  }, []);
  const handleChange = useCallback(
    e => {
      changeSearch(e.target.value);
      triggerChangeCurrentSearch(e.target.value);
    },
    [triggerChangeCurrentSearch]
  );

  console.log("Rerender books search");

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
      <BooksSearchResults search={currentSearch} />
    </SectionContainer>
  );
};

export default memo(BooksSearch);
