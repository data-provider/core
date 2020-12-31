import Proptypes from "prop-types";

const SearchTitle = ({ title }) => {
  return <p className="content__title">Search {title}</p>;
};

SearchTitle.propTypes = {
  title: Proptypes.string.isRequired,
};

export default SearchTitle;
