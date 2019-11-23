/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import PrismicClient from "prismic-javascript";
import { Origin } from "@data-provider/core";

const PRISMIC_TAG = "prismic";
const defaultConfig = {
  release: null,
  fullResponse: false,
  url: ""
};

export class Prismic extends Origin {
  constructor(url, options = {}) {
    const tags = Array.isArray(options.tags) ? options.tags : [options.tags];
    tags.push(PRISMIC_TAG);
    super(`prismic-${url}`, options.defaultValue, {
      ...defaultConfig,
      ...{ url },
      ...options,
      tags
    });
  }

  _config(configuration) {
    if (this._url !== configuration.url) {
      this._prismicApi = null;
      this._url = configuration.url;
      this.clean();
    }
    this._fullResponse = configuration.fullResponse;
    this._release = configuration.release;
  }

  _prismicQuery(query) {
    const prismicQuery = [];
    if (query && query.documentType) {
      prismicQuery.push(PrismicClient.Predicates.at("document.type", query.documentType));
    }
    return prismicQuery;
  }

  _prismicRequest(query) {
    this._prismicApi = this._prismicApi || PrismicClient.api(this._url);
    return this._prismicApi.then(api => {
      const apiParams = {};
      if (this._release) {
        apiParams.ref = this._release;
      }
      return api.query(this._prismicQuery(query), apiParams).then(response => {
        return Promise.resolve(this._fullResponse ? response : response.results);
      });
    });
  }

  _read(query) {
    const cached = this._cache.get(query);
    if (cached) {
      return cached;
    }
    const request = this._prismicRequest(query).catch(err => {
      this._cache.set(query, null);
      return Promise.reject(err);
    });
    this._cache.set(query, request);
    return request;
  }
}
