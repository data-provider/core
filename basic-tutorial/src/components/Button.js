import React from "react";
import PropTypes from "prop-types";

const Button = ({ active, children, onClick }) => {
  return (
    <button
      disabled={active}
      onClick={onClick}
    >
      {children}
    </button>
  )
};

Button.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
};

export default Button;
