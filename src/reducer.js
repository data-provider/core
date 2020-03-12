/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { storeNamespace } from "./storeNamespace";
import { INIT, RESET_STATE, READ_START, READ_SUCCESS, READ_ERROR, MIGRATE_STORE } from "./helpers";

const DEFAULT_INITAL_STATE = {
  loading: false,
  error: null,
  data: undefined
};

const merge = (state, actionIdState, action) => {
  return {
    ...state,
    [action.id]: {
      ...state[action.id],
      ...actionIdState
    }
  };
};

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case storeNamespace.add(READ_START):
      return merge(
        state,
        {
          loading: true
        },
        action
      );
    case storeNamespace.add(READ_SUCCESS):
      return merge(
        state,
        {
          loading: false,
          data: action.data,
          error: null
        },
        action
      );
    case storeNamespace.add(READ_ERROR):
      return merge(
        state,
        {
          loading: false,
          error: action.error
        },
        action
      );
    case storeNamespace.add(RESET_STATE):
      return merge(
        state,
        {
          ...DEFAULT_INITAL_STATE,
          ...action.initialState
        },
        action
      );
    case storeNamespace.add(MIGRATE_STORE):
      return {
        ...state,
        ...action.state[storeNamespace.get()]
      };
    case storeNamespace.add(INIT):
      return {
        ...state,
        [action.id]: {
          ...DEFAULT_INITAL_STATE,
          ...action.initialState
        }
      };
    default:
      return state;
  }
}

export function migrate(state, newNamespace) {
  return { baseType: MIGRATE_STORE, type: storeNamespace.add(MIGRATE_STORE), state, newNamespace };
}

export function init(id, initialState) {
  return { baseType: INIT, type: storeNamespace.add(INIT), id, initialState };
}

export function resetState(id, initialState) {
  return {
    baseType: RESET_STATE,
    type: storeNamespace.add(RESET_STATE),
    id,
    initialState
  };
}

export function readStart(id) {
  return { baseType: READ_START, type: storeNamespace.add(READ_START), id };
}

export function readSuccess(id, data) {
  return {
    baseType: READ_SUCCESS,
    type: storeNamespace.add(READ_SUCCESS),
    id,
    data
  };
}

export function readError(id, error) {
  return { baseType: READ_ERROR, type: storeNamespace.add(READ_ERROR), id, error };
}
