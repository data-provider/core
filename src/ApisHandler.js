/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { instances } from "@data-provider/core";

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
      instances.getByTag(TAG).config(configuration);
    } else {
      this._ensureArray(tags).forEach(tag => {
        instances.getByTag(tag).config(configuration);
      });
    }
  }

  _getHeaders(tags) {
    let headers = instances.getByTag(TAG)._apiHeaders;
    tags.forEach(tag => {
      const byTaginstances = instances.getByTag(tag);
      headers = { ...headers, ...byTaginstances._apiHeaders };
    });
    return headers;
  }

  setHeaders(headers, tags) {
    if (!tags) {
      const allinstances = instances.getByTag(TAG);
      allinstances._apiHeaders = headers;
      allinstances.call(SET_HEADERS_METHOD, headers);
    } else {
      this._ensureArray(tags).forEach(tag => {
        const byTaginstances = instances.getByTag(tag);
        byTaginstances._apiHeaders = headers;
        instances.getByTag(tag).call(SET_HEADERS_METHOD, headers);
      });
    }
  }

  addHeaders(headers, tags) {
    if (!tags) {
      const allinstances = instances.getByTag(TAG);
      allinstances._apiHeaders = { ...allinstances._apiHeaders, ...headers };
      allinstances.call(ADD_HEADERS_METHOD, headers);
    } else {
      this._ensureArray(tags).forEach(tag => {
        const byTaginstances = instances.getByTag(tag);
        byTaginstances._apiHeaders = { ...byTaginstances._apiHeaders, ...headers };
        instances.getByTag(tag).call(ADD_HEADERS_METHOD, headers);
      });
    }
  }

  clean(tags) {
    warn("clean");
    if (!tags) {
      instances.getByTag(TAG).clean();
    } else {
      this._ensureArray(tags).forEach(tag => {
        instances.getByTag(tag).clean();
      });
    }
  }

  reset() {
    warn("reset");
    instances.getByTag(TAG).clear();
  }
}
