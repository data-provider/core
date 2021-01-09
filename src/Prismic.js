/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import PrismicClient from "prismic-javascript";
import { Provider } from "@data-provider/core";

const PRISMIC_TAG = "prismic";
const defaultConfig = {
  release: null,
  fullResponse: false,
  url: "",
};

export class Prismic extends Provider {
  constructor(options, queryValue) {
    super({ ...defaultConfig, ...options }, queryValue);
  }

  configMethod(configuration) {
    if (this._url !== configuration.url) {
      this._prismicApi = null;
      this._url = configuration.url;
      this.cleanCache({ force: true });
    }
    this._fullResponse = configuration.fullResponse;
    this._release = configuration.release;
  }

  _prismicQuery(queryValue) {
    const prismicQuery = [];
    if (queryValue && queryValue.documentType) {
      prismicQuery.push(PrismicClient.Predicates.at("document.type", queryValue.documentType));
    }
    return prismicQuery;
  }

  _prismicRequest(queryValue) {
    this._prismicApi =
      this._prismicApi || (this.parent && this.parent._prismicApi) || PrismicClient.api(this._url);
    return this._prismicApi.then((api) => {
      const apiParams = {};
      if (this._release) {
        apiParams.ref = this._release;
      }
      return api.query(this._prismicQuery(queryValue), apiParams).then((response) => {
        return Promise.resolve(this._fullResponse ? response : response.results);
      });
    });
  }

  readMethod() {
    return this._prismicRequest(this.queryValue);
  }

  get baseTags() {
    return PRISMIC_TAG;
  }
}
