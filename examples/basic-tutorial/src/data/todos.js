import { Axios } from "@data-provider/axios";
import { Selector } from "@data-provider/core";

export const todos = new Axios({
  id: "todos",
  url: "/todos",
});

export const todo = new Axios({
  id: "todo",
  url: "/todos/:id",
});

export const todosFiltered = new Selector(
  todos,
  (queryValue, todosResults) => {
    if (queryValue.completed === null) {
      return todosResults;
    }
    return todosResults.filter((todoResult) => todoResult.completed === queryValue.completed);
  },
  {
    id: "todos-filtered",
    initialState: {
      data: [],
    },
  }
);

const cleanTodosCache = (response) => {
  todos.cleanCache();
  return Promise.resolve(response);
};

export const createTodo = (text) => {
  return todos.create({
    text,
    completed: false,
  });
};

export const updateTodo = (id, completed) => {
  return todo.query({ urlParams: { id } }).update({ completed }).then(cleanTodosCache);
};

export const deleteTodo = (id) => {
  return todo.query({ urlParams: { id } }).delete().then(cleanTodosCache);
};
