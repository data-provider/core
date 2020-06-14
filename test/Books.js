import React from "react";
import PropTypes from "prop-types";

const BooksList = ({ books = [], loading, error }) => {
  if (error) {
    return <div data-testid="error">{error.message}</div>;
  }
  if (loading) {
    return <div data-testid="loading">Loading</div>;
  }
  return (
    <div data-testid="container">
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

BooksList.propTypes = {
  books: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

export default BooksList;
