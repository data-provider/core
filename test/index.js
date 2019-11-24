/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const test = require("mocha-sinon-chai");

const index = require("../src/index");

test.describe("index", () => {
  test.it("should export Provider", () => {
    test.expect(index.Provider).to.not.be.undefined();
  });

  test.it("should export Selector", () => {
    test.expect(index.Selector).to.not.be.undefined();
  });

  test.it("should export instances", () => {
    test.expect(index.instances).to.not.be.undefined();
  });
});
