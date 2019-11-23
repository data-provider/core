## Instances API

#### Root methods

* size `instances.size` - Getter returning current size of data-provider instances created.
* elements `instances.elements` - Getter returning an `<Array>` containing all data-provider instances created.
* getBytag `instances.getByTag(tag)`
	* Alias - `getByTag`
	* Arguments
		* tag - `<String>` Tag to filter instances by.
	* Returns
		* An "instances group", containing methods described below. Will return "instances" containing tag provided as argument.
* getById `instances.getById(id)`
	* Arguments
		* id - `<String>` Id of the data-provider instance to get.
	* Returns
		* An "instances group" containing only the instance with provided id, containing methods described below.
* clean `instances.clean()` - Dispatches clean method of all registered data-provider instances.
	* Returns
		* An "instances group" containing all registered data-provider instances, for chainability purposes.
* call `instances.call(methodName[, argument1[, ...]])` - Executes a certain method in all registered data-provider instances.
	* Arguments
		* methodName - `<String>` Name of the method to call.
		* [...] - The rest of arguments will be passed to the instances original methods when are executed.
	* Returns
		* `<Array>` - Array containing the results of all data-provider instances methods called. If the method does not exist in a certain instance, it will result in `undefined`.

#### Instances group

* size `instances.size` - Getter returning current size of data-provider instances group.
* elements `group.elements` - Getter returning an `<Array>` containing all data-provider instances in the group.
* clean `group.clean()` - Dispatches clean method of all data-provider instances in the group.
	* Returns
		* same "instances group", for chainability purposes.
* call `group.call(methodName[, argument1[, ...]])` - Executes a certain method in all data-provider instances in the group.
	* Arguments
		* methodName - `<String>` Name of the method to call.
		* [...] - The rest of arguments will be passed to the instances original methods when are executed.
	* Returns
		* `<Array>` - Array containing the results of all data-provider instances methods called. If the method does not exist in a certain instance, it will result in `undefined`.

#### Chainability

As described in the API, all methods (except call) returns again the main object itself, so you can chain invocations.

#### Examples

```js
import { instances } from "@data-provider/core";

console.log(instances.size);

instances.getById("foo").clean();

// Call "addHeaders" in instances containing "need-auth" tag.
instances.getByTag("need-auth").call("addHeaders", {
  authentication: "foo-header"
});

// Trace all instances ids.
instances.elements.forEach(element => {
  console.log(element._id);
});

instances.getByTag("api").elements.forEach(element => {
  console.log('This instance is tagged as "api"', element._id);
});
```
