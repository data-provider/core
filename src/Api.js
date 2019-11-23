/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { once } from "lodash";
import pathToRegexp from "path-to-regexp";
import axios from "axios";
import axiosRetry from "axios-retry";
import { Origin } from "@data-provider/core";

import { ApisHandler, TAG } from "./ApisHandler";
import { defaultConfig } from "./defaultConfig";

const PATH_SEP = "/";

export const apis = new ApisHandler();

export class Api extends Origin {
  constructor(url, options = {}) {
    const tags = Array.isArray(options.tags) ? options.tags : [options.tags];
    tags.unshift(TAG);
    options.tags = tags;
    options.url = url;
    super(`api-${url}`, options.defaultValue, { ...defaultConfig, ...options });
    this.setHeaders(apis._getHeaders(this._tags));
  }

  _addOnBeforeRequest(onceBeforeRequest) {
    this._originalOnceBeforeRequest = onceBeforeRequest;
    this._onceBeforeRequest = onceBeforeRequest ? once(onceBeforeRequest) : null;
  }

  _config(configuration) {
    if (configuration.onceBeforeRequest !== this._originalOnceBeforeRequest) {
      this._addOnBeforeRequest(configuration.onceBeforeRequest);
    }
    this._readMethod = configuration.readMethod;
    this._updateMethod = configuration.updateMethod;
    this._createMethod = configuration.createMethod;
    this._deleteMethod = configuration.deleteMethod;
    this._authErrorStatus = configuration.authErrorStatus;
    this._authErrorHandler = configuration.authErrorHandler;
    this._useCache = configuration.cache;
    this._fullResponse = configuration.fullResponse;
    this._validateStatus = configuration.validateStatus;
    this._validateResponse = configuration.validateResponse;
    this._errorHandler = configuration.errorHandler;
    this._baseUrl = configuration.baseUrl;
    this._onBeforeRequest = configuration.onBeforeRequest;
    this._url = configuration.url;

    if (configuration.retries !== this._retries) {
      this._retries = configuration.retries;
      this.client = axios.create();

      axiosRetry(this.client, {
        retries: configuration.retries
      });
    }

    if (configuration.expirationTime !== this._expirationTime) {
      this._expirationTime = configuration.expirationTime;
      if (this.cleanInterval) {
        clearInterval(this.cleanInterval);
      }
      if (configuration.expirationTime > 0) {
        this.cleanInterval = setInterval(() => this.clean(), configuration.expirationTime);
      }
    }

    this._setUrl(this._baseUrl + this._url);
  }

  _getQueryString(queryString) {
    if (!queryString) {
      return "";
    }
    return (
      "?" +
      Object.keys(queryString)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryString[key])}`)
        .join("&")
    );
  }

  _getUrl(query = {}) {
    const queryString = query.queryString || query.query;
    const urlParams = query.urlParams || query.params;
    if (urlParams) {
      return `${this.url.base}/${this.url.segment(urlParams)}${this._getQueryString(queryString)}`;
    }
    return `${this.url.full}${this._getQueryString(queryString)}`;
  }

  _setUrl(baseUrl) {
    const splittedUrl = baseUrl.split(PATH_SEP).filter(pathPortion => pathPortion !== "");
    const hasProtocol = splittedUrl[0].indexOf("http") > -1;

    this.url = {
      base: hasProtocol ? `${splittedUrl[0]}//${splittedUrl[1]}` : "",
      full: baseUrl,
      segment: pathToRegexp.compile(
        hasProtocol
          ? splittedUrl.slice(2, splittedUrl.length).join(PATH_SEP)
          : splittedUrl.join(PATH_SEP)
      )
    };
  }

  _doRequest(requestOptions, isAuthRetry) {
    const retry = () => {
      this._doBeforeRequest();
      return this._doRequest(
        {
          ...requestOptions,
          headers: this._headers
        },
        true
      );
    };

    return this.client(requestOptions)
      .then(response => (this._fullResponse ? response : response.data))
      .then(customResponse => {
        if (this._validateResponse) {
          return this._validateResponse(customResponse);
        }
        return Promise.resolve(customResponse);
      })
      .catch(error => {
        if (
          !isAuthRetry &&
          this._authErrorHandler &&
          error.response &&
          error.response.status === this._authErrorStatus
        ) {
          return this._authErrorHandler(this, retry);
        }
        return this._errorHandler(error);
      });
  }

  _doBeforeRequest() {
    if (this._onBeforeRequest) {
      this._onBeforeRequest(this);
    }
    if (this._onceBeforeRequest) {
      this._onceBeforeRequest(this);
    }
  }

  _readRequest(url) {
    return this._doRequest({
      url,
      validateStatus: this._validateStatus,
      method: this._readMethod,
      headers: this._headers
    });
  }

  _updateRequest(url, data) {
    return this._doRequest({
      url,
      data,
      validateStatus: this._validateStatus,
      method: this._updateMethod,
      headers: this._headers
    });
  }

  _createRequest(url, data) {
    return this._doRequest({
      url,
      data,
      validateStatus: this._validateStatus,
      method: this._createMethod,
      headers: this._headers
    });
  }

  _deleteRequest(url) {
    return this._doRequest({
      url,
      validateStatus: this._validateStatus,
      method: this._deleteMethod,
      headers: this._headers
    });
  }

  _readFromCache(query, url) {
    const cached = this._cache.get(query);
    if (cached) {
      return cached;
    }
    const request = this._readRequest(url).catch(err => {
      this._cache.set(query, null);
      return Promise.reject(err);
    });
    this._cache.set(query, request);
    return request;
  }

  _read(query) {
    this._doBeforeRequest();
    const url = this._getUrl(query);
    if (this._useCache) {
      return this._readFromCache(query, url);
    }
    return this._readRequest(url);
  }

  _cleanAfterRequest(request, query) {
    return request.then(responseData => {
      this._clean(query);
      return Promise.resolve(responseData);
    });
  }

  _update(query, data) {
    this._doBeforeRequest();
    return this._cleanAfterRequest(this._updateRequest(this._getUrl(query), data), query);
  }

  _create(query, data) {
    this._doBeforeRequest();
    return this._cleanAfterRequest(this._createRequest(this._getUrl(query), data));
  }

  _delete(query) {
    this._doBeforeRequest();
    return this._cleanAfterRequest(this._deleteRequest(this._getUrl(query)), query);
  }

  setHeaders(headers) {
    this._headers = headers;
  }

  addHeaders(headers) {
    this._headers = {
      ...this._headers,
      ...headers
    };
  }
}
