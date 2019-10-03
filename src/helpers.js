const CACHE_EVENT_PREFIX = "clean-cache-";
const CHANGE_EVENT_PREFIX = "change-";
const ANY_SUFIX = "any";

export const CREATE_METHOD = "create";
export const READ_METHOD = "read";
export const UPDATE_METHOD = "update";
export const DELETE_METHOD = "delete";

export const DISPATCH = "Dispatch";
export const SUCCESS = "Success";
export const ERROR = "Error";

export const VALID_METHODS = [CREATE_METHOD, READ_METHOD, UPDATE_METHOD, DELETE_METHOD];

export const CHANGE_ANY_EVENT_NAME = `${CHANGE_EVENT_PREFIX}${ANY_SUFIX}`;
export const CLEAN_ANY_EVENT_NAME = `${CACHE_EVENT_PREFIX}${ANY_SUFIX}`;

export const isCacheEventName = eventName =>
  eventName.indexOf(CACHE_EVENT_PREFIX) === 0 && eventName !== CLEAN_ANY_EVENT_NAME;

export const cleanCacheEventName = query => `${CACHE_EVENT_PREFIX}${queryId(query)}`;
export const changeEventName = query => `${CHANGE_EVENT_PREFIX}${queryId(query)}`;

export const actions = {
  [CREATE_METHOD]: {
    dispatch: `${CREATE_METHOD}${DISPATCH}`,
    success: `${CREATE_METHOD}${SUCCESS}`,
    error: `${CREATE_METHOD}${ERROR}`
  },
  [UPDATE_METHOD]: {
    dispatch: `${UPDATE_METHOD}${DISPATCH}`,
    success: `${UPDATE_METHOD}${SUCCESS}`,
    error: `${UPDATE_METHOD}${ERROR}`
  },
  [READ_METHOD]: {
    dispatch: `${READ_METHOD}${DISPATCH}`,
    success: `${READ_METHOD}${SUCCESS}`,
    error: `${READ_METHOD}${ERROR}`
  },
  [DELETE_METHOD]: {
    dispatch: `${DELETE_METHOD}${DISPATCH}`,
    success: `${DELETE_METHOD}${SUCCESS}`,
    error: `${DELETE_METHOD}${ERROR}`
  }
};

export const hash = str => {
  return `${str.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0)}`;
};

export const isUndefined = variable => typeof variable === "undefined";

export const queryId = query => (isUndefined(query) ? query : `(${JSON.stringify(query)})`);

export const dashJoin = arr => arr.filter(val => !isUndefined(val)).join("-");

export const uniqueId = (id, defaultValue) => hash(`${id}${JSON.stringify(defaultValue)}`);

export const queriedUniqueId = (uniqueId, queryUniqueId) => dashJoin([uniqueId, queryUniqueId]);

export const seemsToBeSelectorOptions = defaultValueOrOptions => {
  if (isUndefined(defaultValueOrOptions)) {
    return false;
  }
  return !!defaultValueOrOptions.defaultValue || !!defaultValueOrOptions.uuid;
};
