import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { storeManager } from "@data-provider/core";

function ReduxProvider({ children }) {
  return (
    <Provider store={storeManager.store}>
      <div>{children}</div>
    </Provider>
  );
}

ReduxProvider.propTypes = {
  children: PropTypes.node,
};

export default ReduxProvider;
