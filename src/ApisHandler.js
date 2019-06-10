"use strict";

import { each, isArray } from "lodash";

export class ApisHandler {
  constructor() {
    this._all = [];
    this._tagged = {};
    this._baseConfig = {};
    this._configs = {};
    this._baseHeaders = {};
    this._headers = {};
    this._baseAddedHeaders = {};
    this._addedHeaders = {};
  }

  _ensureArray(tags) {
    if (!tags) {
      return [];
    }
    return isArray(tags) ? tags : [tags];
  }

  _setBaseConfig(config) {
    this._baseConfig = { ...this._baseConfig, ...config };
    each(this._all, api => {
      api.config(this._baseConfig);
    });
  }

  _setTagConfig(config, tag) {
    this._configs[tag] = { ...this._configs[tag], ...config };
    each(this._tagged[tag], api => {
      api.config(this._configs[tag]);
    });
  }

  _setBaseHeaders(headers) {
    this._baseHeaders = headers;
    each(this._all, api => {
      api.setHeaders(this._baseHeaders);
    });
  }

  _setTagHeaders(headers, tag) {
    this._headers[tag] = headers;
    each(this._tagged[tag], api => {
      api.setHeaders(this._headers[tag]);
    });
  }

  _addBaseHeaders(headers) {
    this._baseAddedHeaders = { ...this._baseAddedHeaders, ...headers };
    each(this._all, api => {
      api.addHeaders(this._baseAddedHeaders);
    });
  }

  _addTagHeaders(headers, tag) {
    this._addedHeaders[tag] = { ...this._addedHeaders[tag], ...headers };
    each(this._tagged[tag], api => {
      api.addHeaders(this._addedHeaders[tag]);
    });
  }

  _cleanAll() {
    each(this._all, api => {
      api.clean();
    });
  }

  _clean(tag) {
    each(this._tagged[tag], api => {
      api.clean();
    });
  }

  register(api, tags) {
    this._all.push(api);
    this._ensureArray(tags).forEach(tag => {
      this._tagged[tag] = this._tagged[tag] || [];
      this._tagged[tag].push(api);
    });
  }

  getConfig(customConfig) {
    const clonedCustomConfig = { ...customConfig };
    delete clonedCustomConfig.tags;
    let totalConfig = { ...this._baseConfig, ...clonedCustomConfig };
    this._ensureArray(customConfig.tags).forEach(tag => {
      totalConfig = {
        ...totalConfig,
        ...this._configs[tag]
      };
    });
    return totalConfig;
  }

  getHeaders(tags) {
    let headers = { ...this._baseHeaders, ...this._baseAddedHeaders };
    this._ensureArray(tags).forEach(tag => {
      headers = {
        ...headers,
        ...this._headers[tag],
        ...this._addedHeaders[tag]
      };
    });
    return headers;
  }

  setConfig(configuration, tags) {
    const config = { ...configuration };
    if (!tags) {
      this._setBaseConfig(config);
    } else {
      this._ensureArray(tags).forEach(tag => {
        this._setTagConfig(config, tag);
      });
    }
  }

  setHeaders(headers, tags) {
    const clonedHeaders = { ...headers };
    if (!tags) {
      this._setBaseHeaders(clonedHeaders);
    } else {
      this._ensureArray(tags).forEach(tag => {
        this._setTagHeaders(clonedHeaders, tag);
      });
    }
  }

  addHeaders(headers, tags) {
    const clonedHeaders = { ...headers };
    if (!tags) {
      this._addBaseHeaders(clonedHeaders);
    } else {
      this._ensureArray(tags).forEach(tag => {
        this._addTagHeaders(clonedHeaders, tag);
      });
    }
  }

  clean(tags) {
    if (!tags) {
      this._cleanAll();
    } else {
      this._ensureArray(tags).forEach(tag => {
        this._clean(tag);
      });
    }
  }
}
