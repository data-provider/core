import React, { memo, Fragment } from "react";
import PropTypes from "prop-types";

import AuthorDelete from "modules/author-delete";
import Author from "components/author";

const AuthorsList = ({ authors }) => {
  console.log("Rendering authors list");
  return (
    <Fragment>
      {authors.map((author) => {
        return (
          <Author
            id={author.id}
            name={author.name}
            key={author.id}
            deleteIcon={<AuthorDelete id={author.id} />}
          />
        );
      })}
    </Fragment>
  );
};

AuthorsList.propTypes = {
  authors: PropTypes.array,
};

export default memo(AuthorsList);
