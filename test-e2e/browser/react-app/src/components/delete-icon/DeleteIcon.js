import React from "react";
import Proptypes from "prop-types";

const DeleteIcon = ({ onClick }) => {
  return (
    <span className="delete" onClick={onClick}>
      🗑️
    </span>
  );
};

DeleteIcon.propTypes = {
  onClick: Proptypes.func.isRequired
};

export default DeleteIcon;
