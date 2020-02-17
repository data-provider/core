import React from "react";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { storeManager } from "@data-provider/core";
import "./configProviders";

import Authors from "modules/authors";
import Books from "modules/books";
import AuthorsSearch from "modules/authors-search";
import BooksSearch from "modules/books-search";

const store = createStore(
  combineReducers({
    dataProviders: storeManager.reducer
  }),
  window && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

storeManager.setStore(store, "dataProviders");

function App() {
  return (
    <Provider store={store}>
      <div className="root">
        <header>Data provider React demo</header>
        <main className="container">
          <div className="row">
            <Authors />
            <Books />
          </div>
          <div className="row">
            <AuthorsSearch />
            <BooksSearch />
          </div>
        </main>
      </div>
    </Provider>
  );
}

export default App;
