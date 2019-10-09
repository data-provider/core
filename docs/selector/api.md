## Selectors API

#### Constructor

* `const selector = new Selector(source, source, parserCallback(sourcesResults[, currentQuery]), [options])`
	* Arguments
		* sources - `<source object or Array of sources objects>` 
			* source object - `<source instance, or customSourceReader object>`
				* source instance - `<instance of an Origin or Selector>` Origin or Selector to read.
				* customSourceReader - `<Object>` with next properties:
					* `source`: `<instance of an Origin or Selector>` Origin or Selector to read.
					* `query`: `<Function>` `query: (currentQuery[, previousSourcesResults])`. Query callback.
						* Arguments:
							* currentQuery - `<Any>` Selector current query.
							* previousSourcesResults - `<Array of Any>` Array containing results of all previously fetched sources in series.
						* Returns:
							* `<Any>` Result of this callback will be passed as `query` to the source.
					* `catch`: `<Function>` `catch: (error[, currentQuery])`.
						* Arguments:
							* error - `<Error>` Error thrown by the read method of the source.
							* currentQuery  - `<Any>` Selector current query.
						* Returns:
							* `<Error>` - Source will throw this error.
							* `<Any>` - Source will return this value instead of error.
							* `<source instance>` - The `read` method of the returned source instance will be called, and returned result will be assigned as value of the current source (Allows to switch to another source if first returns an error)
			* Array of source objects - `<Array of <source object>>` Provided sources will be fetched in parallel.
		* parserCallback - `<Function>`
			* Arguments:
				* sourcesResults - `<Any>` - Results returned by the `read` method of the sources.
				* currentQuery - `<Any>` Selector current query.
			* Returns:
				* Result data - `<Any>`
				* `<Promise>` - The result of the returned Promise will be returned as result data.
				* `<source instance>` - If another source instance is returned, it will be called with same method and data than Selector was.
		* options - `<Object>`
			* defaultValue - `<Any>` Default value to return until real data is returned.
			* uuid - `<String>` Custom uuid to be defined as selector "_id"

#### Instance

* read `selector.read()`
	* Statics:
		* error - `<Error>` If read method returns an error, it will be accessible at this property.
		* loading - `<Boolean>` Will be true while Selector read is in progress.
		* value - `<Any>` Value returned by `read` method.
	* Returns
		* `<Any>` - Result of the parser function.
* create, update, delete `selector.create(data)` These methods can be used only when Selector returns another source.
	* Statics:
		* error - `<Error>` If read method returns an error, it will be accessible at this property.
		* loading - `<Boolean>` Will be true while Selector read is in progress.
		* value - `<Any>` Value returned by `read` method.
	* Arguments
		* data - `<Any>` Data that will be passed to the correspondant create, update or delete method of the returned source.
	* Returns
		* `<Any>` - Result of the correspondant method of returned source.
* clean `selector.clean([query])`
	* Arguments
		* query - `<Any>` Any object, string, array etc. for quering the source.
	* Returns
		* `<undefined>` - Selector instance cache corresponding to the provided query will be cleaned.
* query `selector.query([query])`
	* Arguments
		* query - `<Any>` Any object, string, array etc. for quering the source.
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
