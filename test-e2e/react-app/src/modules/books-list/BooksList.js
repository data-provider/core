import React, { memo, Fragment } from "react";
import PropTypes from "prop-types";

import BookDelete from "modules/book-delete";
import Book from "components/book";

const BooksList = ({ books }) => {
  console.log("Rendering books list");
  return (
    <Fragment>
      {books.map((book) => {
        return (
          <Book
            id={book.id}
            title={book.title}
            authorName={book.authorName}
            key={book.id}
            deleteIcon={<BookDelete id={book.id} />}
          />
        );
      })}
    </Fragment>
  );
};

BooksList.propTypes = {
  books: PropTypes.array,
};

export default memo(BooksList);
