## sources API

#### Root methods

* size `sources.size` - Getter returning current size of data-provider sources created.
* elements `sources.elements` - Getter returning an `<Array>` containing all data-provider sources created.
* getBytag `sources.getByTag(tag)`
	* Alias - `getByTag`
	* Arguments
		* tag - `<String>` Tag to filter sources by.
	* Returns
		* A "sources group", containing methods described below. Will return "sources" containing tag provided as argument.
* getById `sources.getById(id)`
	* Arguments
		* id - `<String>` Id of the data-provider source to get.
	* Returns
		* A "sources group" containing only the source with provided id, containing methods described below.
* clean `sources.clean()` - Dispatches clean method of all registered data-provider sources.
	* Returns
		* A "sources group" containing all registered data-provider sources, for chainability purposes.
* call `sources.call(methodName[, argument1[, ...]])` - Executes a certain method in all registered data-provider sources.
	* Arguments
		* methodName - `<String>` Name of the method to call.
		* [...] - The rest of arguments will be passed to the sources original methods when are executed.
	* Returns
		* `<Array>` - Array containing the results of all data-provider sources methods called. If the method does not exist in a certain source, it will result in `undefined`.

#### Sources group

* size `sources.size` - Getter returning current size of data-provider sources group.
* elements `group.elements` - Getter returning an `<Array>` containing all data-provider sources in the group.
* clean `group.clean()` - Dispatches clean method of all data-provider sources in the group.
	* Returns
		* same "sources group", for chainability purposes.
* call `group.call(methodName[, argument1[, ...]])` - Executes a certain method in all data-provider sources in the group.
	* Arguments
		* methodName - `<String>` Name of the method to call.
		* [...] - The rest of arguments will be passed to the sources original methods when are executed.
	* Returns
		* `<Array>` - Array containing the results of all data-provider sources methods called. If the method does not exist in a certain source, it will result in `undefined`.

#### Chainability

As described in the API, all methods (except call) returns again the main object itself, so you can chain invocations.

#### Examples

```js
import { sources } from "@data-provider/axios";

console.log(sources.size);

sources.getById("foo").clean();

// Call "addHeaders" in sources containing "need-auth" tag.
sources.getByTag("need-auth").call("addHeaders", {
  authentication: "foo-header"
}); 

// Trace all sources ids.
sources.elements.forEach(source => {
  console.log(source._id);
});

sources.getByTag("api").elements.forEach(source => {
  console.log('This source is tagged as "api"', source._id);
});
```
