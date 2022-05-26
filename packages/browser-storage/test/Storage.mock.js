/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const Mock = class Mock {
  constructor(storageKey) {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      getItem: this._sandbox.stub().returns(""),
      setItem: this._sandbox.stub().returns(""),
    };

    this._mock = {
      [storageKey]: this._stubs,
    };
  }

  get stubs() {
    return this._stubs;
  }

  get mock() {
    return this._mock;
  }

  restore() {
    this._sandbox.restore();
  }
};

module.exports = Mock;
