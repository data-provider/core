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
import queryString from "query-string";

import {
  once,
  isEmpty,
  TAG,
  PATH_SEP,
  CREATE_SUCCESS,
  UPDATE_SUCCESS,
  DELETE_SUCCESS,
} from "./helpers";
import { defaultConfig } from "./defaultConfig";

export class Axios extends Provider {
  constructor(options, queryValue) {
    super({ ...defaultConfig, ...options }, queryValue);
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
    this._readVerb = configuration.readVerb;
    this._updateVerb = configuration.updateVerb;
    this._createVerb = configuration.createVerb;
    this._deleteVerb = configuration.deleteVerb;
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
    this._axiosConfig = configuration.axiosConfig;
    this._queryStringConfig = configuration.queryStringConfig;

    if (configuration.retries !== this._retries) {
      this._retries = configuration.retries;
      this.client = axios.create();

      axiosRetry(this.client, {
        retries: configuration.retries,
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

  _getQueryString(queryStringValue) {
    if (!queryStringValue || isEmpty(queryStringValue)) {
      return "";
    }
    return `?${queryString.stringify(queryStringValue, this._queryStringConfig)}`;
  }

  _getUrl() {
    const queryStringValue = this.queryValue.queryString;
    const urlParams = this.queryValue.urlParams;
    if (urlParams && !isEmpty(urlParams)) {
      return `${this.url.base}/${this.url.segment(urlParams)}${
        this.url.trailingSlash
      }${this._getQueryString(queryStringValue)}`;
    }
    return `${this.url.full}${this._getQueryString(queryStringValue)}`;
  }

  _setUrl(fullUrl) {
    const splittedUrl = fullUrl.split(PATH_SEP).filter((pathPortion) => pathPortion !== "");
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
      ),
    };
  }

  _doRequest(requestOptions, isAuthRetry) {
    const retry = () => {
      this._doBeforeRequest();
      return this._doRequest(
        {
          ...this._axiosConfig,
          ...requestOptions,
          headers: this.headers,
        },
        true
      );
    };

    return this.client({ ...this._axiosConfig, ...requestOptions })
      .then((response) => (this._fullResponse ? response : response.data))
      .then((customResponse) => {
        if (this._validateResponse) {
          return this._validateResponse(customResponse);
        }
        return Promise.resolve(customResponse);
      })
      .catch((error) => {
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
      method: this._readVerb,
      headers: this.headers,
    });
  }

  _updateRequest(url, data) {
    return this._doRequest({
      url,
      data,
      validateStatus: this._validateStatus,
      method: this._updateVerb,
      headers: this.headers,
    });
  }

  _createRequest(url, data) {
    return this._doRequest({
      url,
      data,
      validateStatus: this._validateStatus,
      method: this._createVerb,
      headers: this.headers,
    });
  }

  _deleteRequest(url, data) {
    return this._doRequest({
      url,
      data,
      validateStatus: this._validateStatus,
      method: this._deleteVerb,
      headers: this.headers,
    });
  }

  _cleanAfterRequestAndDispatch(request, eventName, data) {
    return request.then((responseData) => {
      this.emit(eventName, data);
      this.cleanCache({ force: true });
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
        ...query.queryString,
      },
      urlParams: {
        ...this.queryValue.urlParams,
        ...query.urlParams,
      },
    };
  }

  update(data) {
    this._doBeforeRequest();
    return this._cleanAfterRequestAndDispatch(
      this._updateRequest(this._getUrl(), data),
      UPDATE_SUCCESS,
      data
    );
  }

  create(data) {
    this._doBeforeRequest();
    return this._cleanAfterRequestAndDispatch(
      this._createRequest(this._getUrl(), data),
      CREATE_SUCCESS,
      data
    );
  }

  delete(data) {
    this._doBeforeRequest();
    return this._cleanAfterRequestAndDispatch(
      this._deleteRequest(this._getUrl(), data),
      DELETE_SUCCESS
    );
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
      ...headers,
    };
  }

  get baseTags() {
    return TAG;
  }
}
