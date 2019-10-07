## sources API

#### Root methods

* size `sources.size` - Getter returning current size of mercury sources created.
* elements `sources.elements` - Getter returning an `<Array>` containing all mercury sources created.
* getBytags `sources.getByTags(tags)`
	* Alias - `getByTag`
	* Arguments
		* tags - `<String> or <Array of Strings>` Tags to filter sources by. If an array is provided, will act as an `||` operator (will return sources containing TAG_1 or TAG_2, or TAG_3, etc.)
	* Returns
		* A "sources group", containing methods described below. Will return "sources" containing any of the tags provided as arguments.
* getById `sources.getById(id)`
	* Arguments
		* id - `<String>` Id of the mercury source to get.
	* Returns
		* A "sources group" containing only the source with provided id, containing methods described below.
* clean `sources.clean()` - Dispatches clean method of all registered mercury sources.
	* Returns
		* A "sources group" containing all registered mercury sources, for chainability purposes.
* call `sources.call(methodName[, argument1[, ...]])` - Executes a certain method in all registered mercury sources.
	* Arguments
		* methodName - `<String>` Name of the method to call.
		* [...] - The rest of arguments will be passed to the sources original methods when are executed.
	* Returns
		* `<Array>` - Array containing the results of all mercury sources methods called. If the method does not exist in a certain source, it will result in `undefined`.

#### Sources group

* `size` - Getter returning current size of mercury sources group.
* `elements` - Getter returning an `<Array>` containing all mercury sources in the group.
* clean `group.clean()` - Dispatches clean method of all mercury sources in the group.
	* Returns
		* same "sources group", for chainability purposes.
* call `sources.call(methodName[, argument1[, ...]])` - Executes a certain method in all mercury sources in the group.
	* Arguments
		* methodName - `<String>` Name of the method to call.
		* [...] - The rest of arguments will be passed to the sources original methods when are executed.
	* Returns
		* `<Array>` - Array containing the results of all mercury sources methods called. If the method does not exist in a certain source, it will result in `undefined`.

#### Chainability

As described in the API, all methods (except call) returns again the main object itself, so you can chain invocations.

#### Examples

```js
import { sources } from "@xbyorange/mercury-api";

console.log(sources.size);

sources.getById("foo").clean();

sources.getByTags(["api", "need-auth"]).call("addHeaders", {
	authentication: "foo-header"
}); // Call "addHeaders" in sources containing "api" or "need-auth" tags.

sources.elements.forEach(source => {
	console.log(source._id);
});

```
