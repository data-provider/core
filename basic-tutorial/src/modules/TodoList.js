import React, { useState } from "react";

import Filters from "../components/Filters";
import FilteredTodoList from "./FilteredTodoList";

const TodoList = ({ showCompletedByDefault }) => {
  const [showCompleted, setShowCompleted] = useState(showCompletedByDefault);

  return (
    <div>
      <FilteredTodoList showCompleted={showCompleted} />
      <Filters
        onClick={show => setShowCompleted(show)}
        showCompleted={showCompleted}
      />
    </div>
  );
};

export default TodoList;
