/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  addBooksServerError,
  addBooksNotFoundError,
  addBooksSuccess,
} = require("../../stats/storage");

module.exports = [
  {
    id: "books-success",
    method: "GET",
    url: "/api/books/success",
    variants: [
      {
        id: "default",
        response: (_req, res) => {
          addBooksSuccess();
          res.status(200);
          res.send([
            {
              author: "Ray Bradbury",
              title: "Fahrenheit 451",
            },
          ]);
        },
      },
    ],
  },
  {
    id: "books-server-error",
    method: "GET",
    url: "/api/books/server-error",
    variants: [
      {
        id: "default",
        response: (_req, res) => {
          addBooksServerError();
          res.status(500);
          res.send({
            statusCode: 500,
            error: "Internal server error",
            message: "Fake Internal server error",
          });
        },
      },
    ],
  },
  {
    id: "books-not-found-error",
    method: "GET",
    url: "/api/books/not-found-error",
    variants: [
      {
        id: "default",
        response: (_req, res) => {
          addBooksNotFoundError();
          res.status(404);
          res.send({
            statusCode: 404,
            error: "Not found",
            message: "Fake Not found",
          });
        },
      },
    ],
  },
];
