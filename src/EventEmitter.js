import { isUndefined } from "./helpers";

export class EventEmitter {
  constructor() {
    this.events = {};
  }

  _getEventListByName(eventName) {
    if (isUndefined(this.events[eventName])) {
      this.events[eventName] = new Set();
    }
    return this.events[eventName];
  }

  on(eventName, fn) {
    this._getEventListByName(eventName).add(fn);
  }

  once(eventName, fn) {
    const self = this;

    const onceFn = function(...args) {
      self.removeListener(eventName, onceFn);
      fn.apply(self, args);
    };
    this.on(eventName, onceFn);
  }

  emit(eventName, ...args) {
    this._getEventListByName(eventName).forEach(fn => {
      fn.apply(this, args);
    });
  }

  removeListener(eventName, fn) {
    this._getEventListByName(eventName).delete(fn);
  }

  get eventNames() {
    return Object.keys(this.events);
  }
}
