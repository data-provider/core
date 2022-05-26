import { useData, useLoaded } from "@data-provider/react";

import { booksWithAuthorName } from "data/books";
import BooksList from "modules/books-list";
import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";

const Books = () => {
  const books = useData(booksWithAuthorName);
  const loaded = useLoaded(booksWithAuthorName);

  console.log("Rendering books loaded", loaded, books);

  return (
    <SectionContainer loading={!loaded} id="books-loaded-column">
      <ItemsTitle title="Books without loading" />
      <ItemsListContainer id="books-loaded-container">
        <BooksList books={books} />
      </ItemsListContainer>
    </SectionContainer>
  );
};

export default Books;
