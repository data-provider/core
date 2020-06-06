import React from "react";
import PropTypes from "prop-types";

import ItemsListContainer from "components/items-list-container";
import Placeholder from "components/placeholder";

const Placeholders = ({ id }) => {
  return (
    <ItemsListContainer id={id} className="placeholders">
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </ItemsListContainer>
  );
};

Placeholders.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Placeholders;
