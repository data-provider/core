/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const NAMESPACE = "dataProvider";

class StoreNamespace {
  constructor() {
    this._namespace = NAMESPACE;
  }

  get() {
    return this._namespace;
  }

  set(namespace) {
    this._namespace = namespace;
  }

  add(actionName) {
    return `${this._namespace}/${actionName}`;
  }
}

export const storeNamespace = new StoreNamespace();
