import Proptypes from "prop-types";

const Author = ({ id, name: authorName, deleteIcon }) => {
  return (
    <li id={`author-${id}`}>
      {deleteIcon} {authorName}
    </li>
  );
};

Author.propTypes = {
  deleteIcon: Proptypes.node.isRequired,
  id: Proptypes.number.isRequired,
  name: Proptypes.string.isRequired,
};

export default Author;
