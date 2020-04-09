import React from "react";
import Proptypes from "prop-types";

const SaveButton = ({ id, onClick }) => {
  return (
    <button id={id} onClick={onClick}>
      Save
    </button>
  );
};

SaveButton.propTypes = {
  id: Proptypes.string.isRequired,
  onClick: Proptypes.func,
};

export default SaveButton;
