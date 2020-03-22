import React, { memo } from "react";
import PropTypes from "prop-types";

import { useRefresh, useData } from "@data-provider/react";

import { authorsProvider } from "data/authors";

const AuthorSelect = ({ onChange }) => {
  useRefresh(authorsProvider);
  const authors = useData(authorsProvider);
  console.log("Rendering author select");

  return (
    <select id="book-author-select" onChange={onChange}>
      <option value="-">-</option>
      {authors.map((author) => {
        return (
          <option value={author.id} key={author.id}>
            {author.name}
          </option>
        );
      })}
    </select>
  );
};

AuthorSelect.propTypes = {
  onChange: PropTypes.func,
};

export default memo(AuthorSelect);
