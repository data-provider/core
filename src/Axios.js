/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { Provider } from "@data-provider/core";
import { compile } from "path-to-regexp";
import axios from "axios";
import axiosRetry from "axios-retry";

import { once, isEmpty, TAG, PATH_SEP } from "./helpers";
import { defaultConfig } from "./defaultConfig";

export class Axios extends Provider {
  constructor(id, options, query) {
    const opts = options || {};
    const tags = opts.tags || [];
    tags.unshift(TAG);
    super(id, { ...defaultConfig, ...opts, tags }, query);
  }

  _addOnceBeforeRequest(onceBeforeRequest) {
    this._originalOnceBeforeRequest = onceBeforeRequest;
    this._onceBeforeRequest = onceBeforeRequest ? once(onceBeforeRequest) : null;
  }

  configMethod(configuration) {
    if (configuration.onceBeforeRequest !== this._originalOnceBeforeRequest) {
      this._addOnceBeforeRequest(configuration.onceBeforeRequest);
    }
    this._headers = this._headers || configuration.headers;
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
        this.cleanInterval = setInterval(() => this.cleanCache(), configuration.expirationTime);
      }
    }

    this._setUrl(this._baseUrl + this._url);
  }

  _getQueryString(queryString) {
    if (!queryString || isEmpty(queryString)) {
      return "";
    }
    return (
      "?" +
      Object.keys(queryString)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryString[key])}`)
        .join("&")
    );
  }

  _getUrl() {
    const queryString = this.queryValue.queryString;
    const urlParams = this.queryValue.urlParams;
    if (urlParams && !isEmpty(urlParams)) {
      return `${this.url.base}/${this.url.segment(urlParams)}${
        this.url.trailingSlash
      }${this._getQueryString(queryString)}`;
    }
    return `${this.url.full}${this._getQueryString(queryString)}`;
  }

  _setUrl(fullUrl) {
    const splittedUrl = fullUrl.split(PATH_SEP).filter(pathPortion => pathPortion !== "");
    const hasProtocol = splittedUrl[0].indexOf("http") > -1;

    this.url = {
      base: hasProtocol ? `${splittedUrl[0]}${PATH_SEP}${PATH_SEP}${splittedUrl[1]}` : "",
      full: fullUrl,
      trailingSlash: fullUrl[fullUrl.length - 1] === PATH_SEP ? PATH_SEP : "",
      segment: compile(
        hasProtocol
          ? splittedUrl.slice(2, splittedUrl.length).join(PATH_SEP)
          : splittedUrl.join(PATH_SEP),
        { encode: encodeURIComponent }
      )
    };
  }

  _doRequest(requestOptions, isAuthRetry) {
    const retry = () => {
      this._doBeforeRequest();
      return this._doRequest(
        {
          ...requestOptions,
          headers: this.headers
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
      headers: this.headers
    });
  }

  _updateRequest(url, data) {
    return this._doRequest({
      url,
      data,
      validateStatus: this._validateStatus,
      method: this._updateMethod,
      headers: this.headers
    });
  }

  _createRequest(url, data) {
    return this._doRequest({
      url,
      data,
      validateStatus: this._validateStatus,
      method: this._createMethod,
      headers: this.headers
    });
  }

  _deleteRequest(url) {
    return this._doRequest({
      url,
      validateStatus: this._validateStatus,
      method: this._deleteMethod,
      headers: this.headers
    });
  }

  _cleanAfterRequestAndDispatch(request, eventName, data) {
    return request.then(responseData => {
      this.emit(eventName, data);
      this.cleanCache();
      return Promise.resolve(responseData);
    });
  }

  readMethod() {
    this._doBeforeRequest();
    return this._readRequest(this._getUrl());
  }

  getChildQueryMethod(query) {
    return {
      ...this.queryValue,
      ...query,
      queryString: {
        ...this.queryValue.queryString,
        ...query.queryString
      },
      urlParams: {
        ...this.queryValue.urlParams,
        ...query.urlParams
      }
    };
  }

  update(data) {
    this._doBeforeRequest();
    return this._cleanAfterRequestAndDispatch(
      this._updateRequest(this._getUrl(), data),
      "update",
      data
    );
  }

  create(data) {
    this._doBeforeRequest();
    return this._cleanAfterRequestAndDispatch(
      this._createRequest(this._getUrl(), data),
      "create",
      data
    );
  }

  delete() {
    this._doBeforeRequest();
    return this._cleanAfterRequestAndDispatch(this._deleteRequest(this._getUrl()), "delete");
  }

  get headers() {
    return this._headers || {};
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
