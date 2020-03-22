import React, { useCallback } from "react";
import Proptypes from "prop-types";

import { deleteBook } from "data/books";
import DeleteIcon from "components/delete-icon";

const BookDelete = ({ id }) => {
  const onClick = useCallback(() => {
    deleteBook(id);
  }, [id]);

  return <DeleteIcon onClick={onClick} />;
};

BookDelete.propTypes = {
  id: Proptypes.number,
};

export default BookDelete;
