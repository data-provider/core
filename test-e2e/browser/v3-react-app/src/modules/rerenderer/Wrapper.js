import PropTypes from "prop-types";

import BooksList from "modules/books-list";

import Loading from "./Loading";

const Wrapper = ({ isLoading, ...rest }) => {
  if (isLoading) {
    return <Loading isLoading />;
  }
  return <BooksList {...rest} />;
};

Wrapper.propTypes = {
  isLoading: PropTypes.bool,
};

export default Wrapper;
