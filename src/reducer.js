/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { storeNamespace } from "./storeNamespace";

const INIT = "init";
const CLEAN_CACHE = "cleanCache";
const RESET_STATE = "resetState";
const RESET_STATS = "resetStats";
const READ_START = "readStart";
const READ_SUCCESS = "readSuccess";
const READ_ERROR = "readError";
const MIGRATE_STORE = "migrateStore";

const merge = (state, actionIdState, action) => {
  return {
    ...state,
    [action.id]: {
      ...state[action.id],
      stats: {
        ...state[action.id].stats,
        actions: {
          ...state[action.id].stats.actions,
          [action.baseType]: state[action.id].stats.actions[action.baseType] + 1
        }
      },
      ...actionIdState
    }
  };
};

const INITIAL_STATS = {
  actions: {
    [INIT]: 1,
    [CLEAN_CACHE]: 0,
    [RESET_STATE]: 0,
    [READ_START]: 0,
    [READ_SUCCESS]: 0,
    [READ_ERROR]: 0
  }
};

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case storeNamespace.add(MIGRATE_STORE):
      return {
        ...state,
        ...action.state[storeNamespace.get()]
      };
    case storeNamespace.add(INIT):
      return {
        ...state,
        [action.id]: {
          state: {
            loading: false,
            error: null,
            data: action.initialData
          },
          cache: false,
          stats: INITIAL_STATS
        }
      };
    case storeNamespace.add(CLEAN_CACHE):
      return merge(
        state,
        {
          cache: false
        },
        action
      );
    case storeNamespace.add(RESET_STATE):
      return merge(
        state,
        {
          state: {
            ...state[action.id].state,
            data: action.initialData,
            error: null
          }
        },
        action
      );
    case storeNamespace.add(RESET_STATS):
      return merge(
        state,
        {
          stats: INITIAL_STATS
        },
        action
      );
    case storeNamespace.add(READ_START):
      return merge(
        state,
        {
          state: {
            ...state[action.id].state,
            loading: true
          },
          cache: true
        },
        action
      );
    case storeNamespace.add(READ_SUCCESS):
      return merge(
        state,
        {
          state: {
            loading: false,
            data: action.data,
            error: null
          }
        },
        action
      );
    case storeNamespace.add(READ_ERROR):
      return merge(
        state,
        {
          state: {
            ...state[action.id].state,
            loading: false,
            error: action.error
          },
          cache: false
        },
        action
      );
    default:
      return state;
  }
}

export function migrate(state, newNamespace) {
  return { baseType: MIGRATE_STORE, type: storeNamespace.add(MIGRATE_STORE), state, newNamespace };
}

export function init(id, initialData) {
  return { baseType: INIT, type: storeNamespace.add(INIT), id, initialData };
}

export function cleanCache(id) {
  return { baseType: CLEAN_CACHE, type: storeNamespace.add(CLEAN_CACHE), id };
}

export function resetState(id, initialData) {
  return { baseType: RESET_STATE, type: storeNamespace.add(RESET_STATE), id, initialData };
}

export function resetStats(id) {
  return { baseType: RESET_STATS, type: storeNamespace.add(RESET_STATS), id };
}

export function readStart(id) {
  return { baseType: READ_START, type: storeNamespace.add(READ_START), id };
}

export function readSuccess(id, data) {
  return { baseType: READ_SUCCESS, type: storeNamespace.add(READ_SUCCESS), id, data };
}

export function readError(id, error) {
  return { baseType: READ_ERROR, type: storeNamespace.add(READ_ERROR), id, error };
}
