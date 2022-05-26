import { useState } from "react";
import PropTypes from "prop-types";

import Filters from "../components/Filters";
import FilteredTodoList from "./FilteredTodoList";

const TodoList = ({ showCompletedByDefault, title }) => {
  const [showCompleted, setShowCompleted] = useState(showCompletedByDefault);

  return (
    <div>
      <h2>{title}</h2>
      <FilteredTodoList showCompleted={showCompleted} />
      <Filters onClick={(show) => setShowCompleted(show)} showCompleted={showCompleted} />
    </div>
  );
};

TodoList.propTypes = {
  title: PropTypes.string.isRequired,
};

export default TodoList;
