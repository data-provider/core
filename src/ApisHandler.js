"use strict";

import { sources } from "@data-provider/core";

export const TAG = "api";

const SET_HEADERS_METHOD = "setHeaders";
const ADD_HEADERS_METHOD = "addHeaders";

export class ApisHandler {
  _ensureArray(tags) {
    return Array.isArray(tags) ? tags : [tags];
  }

  config(configuration, tags) {
    console.warn(
      'mercury-api apis.config method will be deprecated. Use mercury sources.getByTag("api").config instead'
    );
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
    console.warn(
      `mercury-api apis.clean method will be deprecated. Use mercury sources.getByTag("api").clean instead`
    );
    if (!tags) {
      sources.getByTag(TAG).clean();
    } else {
      this._ensureArray(tags).forEach(tag => {
        sources.getByTag(tag).clean();
      });
    }
  }

  reset() {
    console.warn(
      'mercury-api apis.reset method will be deprecated. Use mercury sources.getByTag("api").clean instead'
    );
    sources.getByTag(TAG).clear();
  }
}
