/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { sources } from "@data-provider/core";

export const TAG = "api";

const SET_HEADERS_METHOD = "setHeaders";
const ADD_HEADERS_METHOD = "addHeaders";

const warn = method => {
  console.warn(
    `@data-provider/axios: Deprecation warning: "apis.${method}" method will be deprecated. Use @data-provider/core "instances.getByTag('api').${method}" instead`
  );
};

export class ApisHandler {
  _ensureArray(tags) {
    return Array.isArray(tags) ? tags : [tags];
  }

  config(configuration, tags) {
    warn("config");
    if (!tags) {
      sources.getByTag(TAG).config(configuration);
    } else {
      this._ensureArray(tags).forEach(tag => {
        sources.getByTag(tag).config(configuration);
      });
    }
  }

  _getHeaders(tags) {
    let headers = sources.getByTag(TAG)._apiHeaders;
    tags.forEach(tag => {
      const byTagSources = sources.getByTag(tag);
      headers = { ...headers, ...byTagSources._apiHeaders };
    });
    return headers;
  }

  setHeaders(headers, tags) {
    if (!tags) {
      const allSources = sources.getByTag(TAG);
      allSources._apiHeaders = headers;
      allSources.call(SET_HEADERS_METHOD, headers);
    } else {
      this._ensureArray(tags).forEach(tag => {
        const byTagSources = sources.getByTag(tag);
        byTagSources._apiHeaders = headers;
        sources.getByTag(tag).call(SET_HEADERS_METHOD, headers);
      });
    }
  }

  addHeaders(headers, tags) {
    if (!tags) {
      const allSources = sources.getByTag(TAG);
      allSources._apiHeaders = { ...allSources._apiHeaders, ...headers };
      allSources.call(ADD_HEADERS_METHOD, headers);
    } else {
      this._ensureArray(tags).forEach(tag => {
        const byTagSources = sources.getByTag(tag);
        byTagSources._apiHeaders = { ...byTagSources._apiHeaders, ...headers };
        sources.getByTag(tag).call(ADD_HEADERS_METHOD, headers);
      });
    }
  }

  clean(tags) {
    warn("clean");
    if (!tags) {
      sources.getByTag(TAG).clean();
    } else {
      this._ensureArray(tags).forEach(tag => {
        sources.getByTag(tag).clean();
      });
    }
  }

  reset() {
    warn("reset");
    sources.getByTag(TAG).clear();
  }
}
