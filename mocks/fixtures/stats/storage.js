/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const INITIAL_STATS = {
  books: {
    notFoundError: 0,
    serverError: 0,
    success: 0
  }
};
let stats;

const addBooksServerError = () => {
  stats.books.serverError = stats.books.serverError + 1;
};

const addBooksNotFoundError = () => {
  stats.books.notFoundError = stats.books.notFoundError + 1;
};

const addBooksSuccess = () => {
  stats.books.success = stats.books.success + 1;
};

const reset = () => {
  stats = JSON.parse(JSON.stringify(INITIAL_STATS));
};

const getAll = () => stats;

reset();

module.exports = {
  addBooksServerError,
  addBooksNotFoundError,
  addBooksSuccess,
  getAll,
  reset
};
