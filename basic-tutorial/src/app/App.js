import AddTodo from "../modules/AddTodo";
import TodoList from "../modules/TodoList";

const App = () => {
  return (
    <div>
      <AddTodo />
      <TodoList showCompletedByDefault={false} />
      <TodoList showCompletedByDefault={true} />
    </div>
  );
};

export default App;
