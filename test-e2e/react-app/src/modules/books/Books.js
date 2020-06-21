import React from "react";

import { useData, useLoading, usePolling } from "@data-provider/react";

import { booksWithAuthorName } from "data/books";
import BooksList from "modules/books-list";
import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";

import BookNew from "./modules/book-new";

const Books = () => {
  const books = useData(booksWithAuthorName);
  const loading = useLoading(booksWithAuthorName);
  usePolling(booksWithAuthorName, 25000);

  console.log("Rendering books", loading, books);

  return (
    <SectionContainer loading={loading} id="books-column">
      <ItemsTitle title="Books" />
      <ItemsListContainer id="books-container">
        <BooksList books={books} />
      </ItemsListContainer>
      <BookNew />
    </SectionContainer>
  );
};

export default Books;
