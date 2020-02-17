import React from "react";
import Proptypes from "prop-types";

import { booksSearch } from "data/books";
import { deleteBook } from "data/books";

import ItemsListContainer from "components/items-list-container";
import DeleteIcon from "components/delete-icon";
import Book from "components/book";
import { useRefresh, useData, useLoading } from "helpers/data-provider";

const BooksSearchResults = ({ search }) => {
  console.log(search);
  useRefresh(booksSearch.query({ search }), [search]);
  const books = useData(booksSearch.query({ search }));
  const loading = useLoading(booksSearch.query({ search }));

  console.log("Rendering books search results", loading, books);

  return (
    <ItemsListContainer id="books-search-container">
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
  );
};

BooksSearchResults.propTypes = {
  search: Proptypes.string
};

export default BooksSearchResults;
