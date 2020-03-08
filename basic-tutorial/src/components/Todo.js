import React from "react";
import PropTypes from "prop-types";

const Todo = ({ onClick, id, completed, text }) => (
  <li
    onClick={() => onClick(id, !completed)}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);

Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
};

export default Todo;
