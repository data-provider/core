/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

export const UPDATE_SUCCESS = "updateSucess";
export const DELETE_SUCCESS = "deleteSucess";
export const CREATE_SUCCESS = "createSucess";

export const eventNames = {
  UPDATE_SUCCESS,
  DELETE_SUCCESS,
  CREATE_SUCCESS
};

export const TAG = "axios";

export const PATH_SEP = "/";

export const once = func => {
  var executed = false;
  let result;
  return function() {
    if (!executed) {
      result = func.apply(this, arguments);
      executed = true;
    } else {
      func = undefined;
    }
    return result;
  };
};

export const isEmpty = obj => {
  return Object.keys(obj).length === 0;
};
