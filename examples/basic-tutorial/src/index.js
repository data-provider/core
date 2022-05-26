import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { storeManager } from "@data-provider/core";

import "./app/config";
import App from "./app/App";

const DATA_PROVIDER_STORE = "data";

const store = createStore(
  combineReducers({
    [DATA_PROVIDER_STORE]: storeManager.reducer,
  }),
  window && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

storeManager.setStore(store, DATA_PROVIDER_STORE);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
