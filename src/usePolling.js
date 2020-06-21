import { useEffect } from "react";

const pollingProviders = {};

class PollingHandler {
  constructor(provider, intervalTime) {
    provider.cleanCache();
    this._provider = provider;
    this._id = provider.id;
    this._clients = 1;
    this._intervalTimes = [];
    this._currentIntervalTime = intervalTime;
    this._intervalTimes.push(intervalTime);
    this._setInterval();
  }

  _setInterval() {
    this._interval = setInterval(() => {
      this._provider.cleanDependenciesCache();
    }, this._currentIntervalTime);
  }

  _clearInterval() {
    clearInterval(this._interval);
  }

  _checkInterval() {
    const sortedIntervals = this._intervalTimes.sort((a, b) => a - b);
    if (sortedIntervals[0] !== this._currentIntervalTime) {
      this._clearInterval();
      this._currentIntervalTime = sortedIntervals[0];
      this._setInterval();
    }
  }

  _removePolling() {
    this._clearInterval();
    pollingProviders[this._id] = null;
  }

  addClient(intervalTime) {
    this._clients = this._clients + 1;
    this._intervalTimes.push(intervalTime);
    this._checkInterval();
  }

  removeClient(intervalTime) {
    this._clients = this._clients - 1;
    if (this._clients === 0) {
      this._removePolling();
    } else {
      this._intervalTimes.splice(this._intervalTimes.indexOf(intervalTime), 1);
      this._checkInterval();
    }
  }
}

export const usePolling = (provider, intervalTime = 5000) => {
  useEffect(() => {
    let clearProviderInterval;
    if (provider) {
      if (pollingProviders[provider.id]) {
        pollingProviders[provider.id].addClient(intervalTime);
      } else {
        pollingProviders[provider.id] = new PollingHandler(provider, intervalTime);
      }
      clearProviderInterval = () => {
        pollingProviders[provider.id].removeClient(intervalTime);
      };
    }
    return clearProviderInterval;
  }, [provider, intervalTime]);
};
