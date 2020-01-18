## Selectors API

#### Constructor

* `const selector = new Selector(provider, provider, parserCallback(providersResults[, currentQuery]), [options])`
	* Arguments
		* providers - `<provider object or Array of providers objects>` 
			* provider object - `<provider instance, or customProviderReader object>`
				* provider instance - `<instance of a Provider or Selector>` Provider or Selector to read.
				* customProviderReader - `<Object>` with next properties:
					* `provider`: `<instance of a Provider or Selector>` Provider or Selector to read.
					* `query`: `<Function>` `query: (currentQuery[, previousProvidersResults])`. Query callback.
						* Arguments:
							* currentQuery - `<Any>` Selector current query.
							* previousProvidersResults - `<Array of Any>` Array containing results of all previously fetched providers in series.
						* Returns:
							* `<Any>` Result of this callback will be passed as `query` to the provider.
					* `catch`: `<Function>` `catch: (error[, currentQuery])`.
						* Arguments:
							* error - `<Error>` Error thrown by the read method of the provider.
							* currentQuery  - `<Any>` Selector current query.
						* Returns:
							* `<Error>` - Selector will throw this error.
							* `<Any>` - Provider will return this value instead of error.
							* `<provider instance>` - The `read` method of the returned provider instance will be called, and returned result will be assigned as value of the current provider (Allows to switch to another provider if first returns an error)
			* Array of provider objects - `<Array of <provider object>>` Provided providers will be fetched in parallel.
		* parserCallback - `<Function>`
			* Arguments:
				* providersResults - `<Any>` - Results returned by the `read` method of the providers.
				* currentQuery - `<Any>` Selector current query.
			* Returns:
				* Result data - `<Any>`
				* `<Promise>` - The result of the returned Promise will be returned as result data.
				* `<provider instance>` - If another provider instance is returned, it will be called with same method and data than Selector was.
		* options - `<Object>`
			* defaultValue - `<Any>` Default value to return until real data is returned.
			* uuid - `<String>` Custom uuid to be defined as selector "\_id"

#### Instance

* read `selector.read()`
	* Statics:
		* error - `<Error>` If read method returns an error, it will be accessible at this property.
		* loading - `<Boolean>` Will be true while Selector read is in progress.
		* value - `<Any>` Value returned by `read` method.
		* stats - `<Object>` Object containing stats about method executions:
			* dispatch - `<Number>` Counter of times that read method has been dispatched when there was no cache.
			* success - `<Number>` Counter of times that read method has been resolved. No matter if result came from cache or not.
			* error - `<Number>` Counter of times that read method has been rejected. No matter if result came from cache or not. 
	* Returns
		* `<Any>` - Result of the parser function.
* create, update, delete `selector.create(data)` These methods can be used only when Selector returns another provider.
	* Statics:
		* error - `<Error>` If read method returns an error, it will be accessible at this property.
		* loading - `<Boolean>` Will be true while Selector read is in progress.
		* value - `<Any>` Value returned by `read` method.
		* stats - `<Object>` Object containing stats about method executions:
			* dispatch - `<Number>` Counter of times that read method has been dispatched when there was no cache.
			* success - `<Number>` Counter of times that read method has been resolved. No matter if result came from cache or not.
			* error - `<Number>` Counter of times that read method has been rejected. No matter if result came from cache or not.
	* Arguments
		* data - `<Any>` Data that will be passed to the correspondant create, update or delete method of the returned provider.
	* Returns
		* `<Any>` - Result of the correspondant method of returned provider.
* clean `selector.clean([query])`
	* Arguments
		* query - `<Any>` Any object, string, array etc. for quering the provider.
	* Returns
		* `<undefined>` - Selector instance cache corresponding to the provided query will be cleaned.
* cleanState `selector.cleanState()` - Returns `value` to defaultValue, and `error` to null. Correspondent change event will be also emitted.
* query `selector.query([query])`
	* Arguments
		* query - `<Any>` Any object, string, array etc. for quering the provider.
	* Returns
		* `<selector instance>` - Will return a selector instance unique for the query provided. Returned instances will be the same if query is the same.
* addCustomQueries `selector.addCustomQueries(customQueryObject)`
	* Aliases
		* addCustomQuery `selector.addCustomQuery({ queryName: queryCallback(query)})`
	* Arguments
		* customQueryObject - `<Object>` containing properties:
			* [key] - `<String>` Key will be used as name of the new selector method that will execute the custom query.
				* queryCallback - `<Function>`
					* Arguments
						* query - `<Any>` Query provided by the user when using custom query method.
					* Returns
						* currentQuery - `<Any>` Query that will be used as current query, and passed to the CRUD methods when executed.
