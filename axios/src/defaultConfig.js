/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

export const defaultConfig = {
  baseUrl: "",
  readVerb: "get",
  updateVerb: "patch",
  createVerb: "post",
  deleteVerb: "delete",
  authErrorStatus: 401,
  authErrorHandler: null,
  onBeforeRequest: null,
  onceBeforeRequest: null,
  expirationTime: 0,
  retries: 3,
  cache: true,
  fullResponse: false,
  validateStatus: (status) => status >= 200 && status < 300,
  validateResponse: null,
  errorHandler: (error) => {
    const errorMessage =
      (error.response && error.response.statusText) || error.message || "Request error";
    const errorToReturn = new Error(errorMessage);
    errorToReturn.data = error.response && error.response.data;
    return Promise.reject(errorToReturn);
  },
  axiosConfig: {},
  queryStringConfig: {},
};
