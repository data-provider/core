## Origin API

### Creating a new Origin connector.

To create a new `Origin`, you should extend from the Mercury `Origin` Class, defining the behavior of the methods `_create`, `_read`, `_update` and `_delete`.

If you don't define one of this methods, the correspondant CRUD method will not be available in the resultant Origin.

Call `super` from your own constructor, passing:
* `super([id, defaultValue, options])`
	* Arguments:
		* `defaultId` - `<String>` Used for debugging purposes. The `_id` of the resultant source will be a hash calculated using this default id and default value (only in case it is not a callback).
		* `defaultValue` - `<Any>` Resultant origin will have this value in the `value` property until data is fetched. If a `<Function>` is provided, it will be executed to obtain the default value, passing the current `query` as argument.
		* `options` - `<Object>` Object containing another options, such as:
			* `uuid` - `<String>` If provided, the resultant instance will have this property as `_id`. It will not be "hashed".
			* `tags` - `<String> or <Array of Strings>` Tags to be assigned to the instance when created. Tags are used by "sources" handler. For further info [read the `sources` documentation](../sources/api.md).

Crud methods will receive two arguments:

* `_read([query, extraParams])`
	* Arguments:
		* `query` If origin is queried, you will receive here the current query.
		* `extraParams` Extra data passed as argument when the method is invoked.
	* Returns: `<Promise>`

Available methods for internal usage:

* `this._cache` Use built-in cache to provide cache to your Origin.
	* `this._cache.set(query, value)`. Set cache for an specific query. Cached objects should be Promises, in order to provide cache too for parallel invokations.
	* `this._cache.get(query)`. Returns cache for an specific query.
	* `this._cache.clean([query])`. Clean cache of an specific query. Cleans all caches if no query is provided.

#### Example

```js
import { Origin } from "@xbyorange/mercury";
import requestPromise from "request-promise";

export class Request extends Origin {
  constructor(url, options = {}) {
    super(url, options.defaultValue, options.uuid);
    this._url = url;
  }

  _read(query) {
    const cached = this._cache.get(query);
    if (cached) {
      return cached;
    }
    const request = requestPromise({
      uri: this._url
    }).catch(err => {
      this._cache.set(query, null);
      return Promise.reject(err);
    });
    this._cache.set(query, request);
    return request;
  }
}
```
