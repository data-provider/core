import React from "react";
import { useData, useLoading, useRefresh } from "@data-provider/react";

import { todosFiltered, updateTodo } from "../data/todos";
import TodoList from "../components/TodoList";

const FilteredTodoList = ({ showCompleted }) => {
  const todosProvider = todosFiltered.query({ completed: showCompleted });
  useRefresh(todosProvider);
  const todos = useData(todosProvider);
  const loading = useLoading(todosProvider);

  if (loading && !todos) {
    return <div>Loading...</div>;
  }
  return (
    <TodoList todos={todos} onTodoClick={updateTodo} />
  );
};

export default FilteredTodoList;
