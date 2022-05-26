import React from "react";
import PropTypes from "prop-types";

import { BOOKS_ID, ERROR_ID, LOADING_ID } from "./constants";

const Books = ({ books = [], loading, error }) => {
  if (error) {
    return <div data-testid={ERROR_ID}>{error.message}</div>;
  }
  if (loading) {
    return <div data-testid={LOADING_ID}>Loading</div>;
  }
  return (
    <div data-testid={BOOKS_ID}>
      {books.map(({ title, id }) => {
        return (
          <li key={`book-${id}`} data-testid={`book-${id}`}>
            {title}
          </li>
        );
      })}
    </div>
  );
};

Books.propTypes = {
  books: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

Books.fooProperty = "foo";

export default Books;
