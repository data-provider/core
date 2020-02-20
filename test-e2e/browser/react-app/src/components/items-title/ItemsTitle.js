import React from "react";
import Proptypes from "prop-types";

const ItemsTitle = ({ title, loading }) => {
  return (
    <p className={`content__title ${loading && "loading"}`}>
      {/* eslint-disable-next-line */}
      <span className="loading">⏳</span> {title}
    </p>
  );
};

ItemsTitle.propTypes = {
  loading: Proptypes.bool,
  title: Proptypes.string.isRequired
};

export default ItemsTitle;
