import React from "react";

import { booksWithAuthorName } from "data/books";
import { deleteBook } from "data/books";

import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";
import DeleteIcon from "components/delete-icon";
import Book from "components/book";
import { useRefresh, useData, useLoading } from "helpers/data-provider";

const Books = () => {
  useRefresh(booksWithAuthorName);
  const books = useData(booksWithAuthorName);
  const loading = useLoading(booksWithAuthorName);

  console.log("Rendering books", loading, books);

  return (
    <SectionContainer loading={loading} id="books-column">
      <ItemsTitle title="Books" />
      <ItemsListContainer id="books-container">
        {books.map(book => {
          const deleteIcon = (
            <DeleteIcon
              onClick={() => {
                deleteBook(book.id);
              }}
            />
          );
          return (
            <Book
              id={book.id}
              title={book.title}
              authorName={book.authorName}
              key={book.id}
              deleteIcon={deleteIcon}
            />
          );
        })}
      </ItemsListContainer>
    </SectionContainer>
  );
};

export default Books;
