import AddTodo from "../modules/AddTodo";
import TodoList from "../modules/TodoList";

const App = () => {
  return (
    <div>
      <AddTodo />
      <TodoList showCompletedByDefault={false} title="Filtered todos 1" />
      <TodoList showCompletedByDefault={true} title="Filtered todos 2" />
    </div>
  );
};

export default App;
