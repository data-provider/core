import Button from "./Button";

const Filters = ({ onClick, showCompleted }) => (
  <p>
    Show:{" "}
    <Button onClick={() => onClick(null)} active={showCompleted === null}>
      All
    </Button>
    {", "}
    <Button onClick={() => onClick(false)} active={showCompleted === false}>
      Active
    </Button>
    {", "}
    <Button onClick={() => onClick(true)} active={showCompleted === true}>
      Completed
    </Button>
  </p>
);

export default Filters;
