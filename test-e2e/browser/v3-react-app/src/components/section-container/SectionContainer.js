import Proptypes from "prop-types";

const SectionContainer = ({ children, id, loading }) => {
  return (
    <div className={`col-6 content ${loading && "loading"}`} id={id}>
      {children}
    </div>
  );
};

SectionContainer.propTypes = {
  loading: Proptypes.bool,
  children: Proptypes.node.isRequired,
  id: Proptypes.string.isRequired,
};

export default SectionContainer;
