import React from "react";
import Proptypes from "prop-types";

const ItemsListContainer = ({ children, id, className }) => {
  return (
    <ul id={id} className={className}>
      {children}
    </ul>
  );
};

ItemsListContainer.propTypes = {
  id: Proptypes.string.isRequired,
  children: Proptypes.node.isRequired,
  className: Proptypes.string,
};

export default ItemsListContainer;
