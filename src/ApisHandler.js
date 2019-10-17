"use strict";

import { sources } from "@xbyorange/mercury";

export const TAG = "api";

export class ApisHandler {
  _ensureArray(tags) {
    return Array.isArray(tags) ? tags : [tags];
  }

  config(configuration, tags) {
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
      allSources.call("setHeaders", headers);
    } else {
      this._ensureArray(tags).forEach(tag => {
        const byTagSources = sources.getByTag(tag);
        byTagSources._apiHeaders = headers;
        sources.getByTag(tag).call("setHeaders", headers);
      });
    }
  }

  addHeaders(headers, tags) {
    if (!tags) {
      const allSources = sources.getByTag(TAG);
      allSources._apiHeaders = { ...allSources._apiHeaders, ...headers };
      allSources.call("addHeaders", headers);
    } else {
      this._ensureArray(tags).forEach(tag => {
        const byTagSources = sources.getByTag(tag);
        byTagSources._apiHeaders = { ...byTagSources._apiHeaders, ...headers };
        sources.getByTag(tag).call("addHeaders", headers);
      });
    }
  }

  clean(tags) {
    if (!tags) {
      sources.getByTag(TAG).clean();
    } else {
      this._ensureArray(tags).forEach(tag => {
        sources.getByTag(tag).clean();
      });
    }
  }

  reset() {
    sources.getByTag(TAG).clear();
  }
}
