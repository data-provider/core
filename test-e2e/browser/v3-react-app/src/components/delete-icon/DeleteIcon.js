import Proptypes from "prop-types";

const DeleteIcon = ({ onClick }) => {
  return (
    <span className="delete" onClick={onClick}>
      {/* eslint-disable-next-line */}
      🗑️
    </span>
  );
};

DeleteIcon.propTypes = {
  onClick: Proptypes.func.isRequired,
};

export default DeleteIcon;
