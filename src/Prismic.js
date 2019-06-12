import PrismicClient from "prismic-javascript";
import { Origin } from "@xbyorange/mercury";

const defaultConfig = {
  release: null,
  fullResponse: false
};

export class Prismic extends Origin {
  constructor(url, config = {}) {
    super(`prismic-${url}`, config && config.defaultValue);
    const configuration = { ...defaultConfig, ...config };
    this._url = url;
    this._config(configuration);
  }

  _config(configuration) {
    this._configuration = { ...configuration };
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

  config(configuration) {
    this._config({ ...this._configuration, ...configuration });
  }
}
