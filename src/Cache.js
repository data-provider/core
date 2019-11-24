/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import {
  CLEAN_ANY_EVENT_NAME,
  queryId,
  cleanCacheEventName,
  isCacheEventName,
  queriedUniqueId,
  isUndefined
} from "./helpers";

export class Cache {
  constructor(eventEmitter, id) {
    this._eventEmitter = eventEmitter;
    this._reset();
    this._id = id;
  }

  _reset() {
    this._cachedData = {};
    this._eventEmitter.eventNames.forEach(eventName => {
      if (isCacheEventName(eventName)) {
        this._eventEmitter.emit(eventName);
      }
    });
  }

  getAnyData(queryUniqueId, _root) {
    const instanceData = {
      _id: queriedUniqueId(this._id, queryUniqueId),
      _queryId: queryUniqueId,
      _root
    };
    return {
      action: "clean",
      instance: instanceData,
      source: instanceData // TODO, deprecate
    };
  }

  clean(query, _root) {
    if (!isUndefined(query)) {
      const queryIdentifier = queryId(query);
      delete this._cachedData[queryIdentifier];
      this._eventEmitter.emit(cleanCacheEventName(query), query);
      this._eventEmitter.emit(CLEAN_ANY_EVENT_NAME, this.getAnyData(queryIdentifier, _root));
    } else {
      this._reset();
      this._eventEmitter.emit(CLEAN_ANY_EVENT_NAME, this.getAnyData(query, _root));
    }
  }

  get(query) {
    return this._cachedData[queryId(query)];
  }

  set(query, data) {
    this._cachedData[queryId(query)] = data;
  }
}
