import React from "react";
import Proptypes from "prop-types";

const Author = ({ id, name, deleteIcon }) => {
  return (
    <li id={`author-${id}`}>
      {deleteIcon} {name}
    </li>
  );
};

Author.propTypes = {
  deleteIcon: Proptypes.node.isRequired,
  id: Proptypes.number.isRequired,
  name: Proptypes.string.isRequired
};

export default Author;
