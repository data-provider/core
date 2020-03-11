import { Axios } from "@data-provider/axios";
import { Selector } from "@data-provider/core";

export const todos = new Axios("todos", {
  url: "/todos"
});

export const todo = new Axios("todo", {
  url: "/todos/:id"
});

export const todosFiltered = new Selector(
  todos,
  (todosResults, query) => {
    if (query.completed === null) {
      return todosResults;
    }
    return todosResults.filter(todo => todo.completed === query.completed)
  },
  {
    id: "todos-filtered"
  }
);

const cleanTodosCache = response => {
  todos.cleanCache();
  return Promise.resolve(response);
};

export const createTodo = text => {
  return todos.create({
    text,
    completed: false
  });
};

export const updateTodo = (id, completed) => {
  return todo.query({ urlParams: { id }})
    .update({ completed })
    .then(cleanTodosCache);
};

export const deleteTodo = id => {
  return todo.query({ urlParams: { id }})
    .delete()
    .then(cleanTodosCache);
};
