import React from "react";

import Link from "./Link";

const Filters = ({ onClick, showCompleted }) => (
  <p>
    Show: <Link onClick={() => onClick(null)} active={showCompleted === null}>All</Link>
    {', '}
    <Link onClick={() => onClick(false)} active={showCompleted === false}>Active</Link>
    {', '}
    <Link onClick={() => onClick(true)} active={showCompleted === true}>Completed</Link>
  </p>
);

export default Filters;
