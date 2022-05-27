import { createTodo } from "../data/todos";
import AddTodoComponent from "../components/AddTodo";

const AddTodo = () => {
  return <AddTodoComponent onSubmit={(text) => createTodo(text)} />;
};

export default AddTodo;
