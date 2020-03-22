import React from "react";
import Proptypes from "prop-types";

const ItemsListContainer = ({ children, id }) => {
  return <ul id={id}>{children}</ul>;
};

ItemsListContainer.propTypes = {
  id: Proptypes.string.isRequired,
  children: Proptypes.node.isRequired,
};

export default ItemsListContainer;
