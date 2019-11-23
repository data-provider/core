/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("axios-retry");

const axios = require("axios");

const Mock = class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stub = this._sandbox.stub().resolves({
      data: {}
    });

    this._sandbox.stub(axios, "create").returns(this._stub);
  }

  get stubs() {
    return {
      instance: this._stub
    };
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
