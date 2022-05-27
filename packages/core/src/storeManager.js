/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { createStore, combineReducers } from "redux";
import { storeNamespace } from "./storeNamespace";
import reducer, { migrate } from "./reducer";

class StoreManager {
  constructor() {
    this._store = createStore(combineReducers({ [storeNamespace.get()]: reducer }));
  }

  get reducer() {
    return reducer;
  }

  setStore(store, namespace) {
    const previousState = this._store.getState();
    this._store = store;
    this._store.dispatch(migrate(previousState, namespace));
    storeNamespace.set(namespace);
  }

  get store() {
    return this._store;
  }

  get namespace() {
    return storeNamespace.get();
  }

  get state() {
    return this._store.getState()[storeNamespace.get()];
  }
}

export const storeManager = new StoreManager();
