import React from "react";
import Proptypes from "prop-types";

const Book = ({ id, title, authorName, deleteIcon }) => {
  return (
    <li id={`book-${id}`}>
      {deleteIcon} {title} <span className="author-name">{authorName}</span>
    </li>
  );
};

Book.propTypes = {
  id: Proptypes.number.isRequired,
  title: Proptypes.string.isRequired,
  authorName: Proptypes.string.isRequired,
  deleteIcon: Proptypes.node.isRequired,
};

export default Book;
