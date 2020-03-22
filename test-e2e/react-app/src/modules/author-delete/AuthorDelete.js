import React, { useCallback } from "react";
import Proptypes from "prop-types";

import { deleteAuthorAndBooks } from "data/books";
import DeleteIcon from "components/delete-icon";

const AuthorDelete = ({ id }) => {
  const onClick = useCallback(() => {
    deleteAuthorAndBooks(id);
  }, [id]);

  return <DeleteIcon onClick={onClick} />;
};

AuthorDelete.propTypes = {
  id: Proptypes.number,
};

export default AuthorDelete;
