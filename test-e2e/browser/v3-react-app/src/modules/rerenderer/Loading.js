import { memo } from "react";
import PropTypes from "prop-types";

const Loading = ({ isLoading }) => {
  console.log("isLoading", isLoading);
  console.log("Rerender loading");

  return <div>Loading....</div>;
};

Loading.propTypes = {
  isLoading: PropTypes.bool,
};

export default memo(Loading);
