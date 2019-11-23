## Configuring multiple apis instances at a time

Use the `tags` option to categorize your api instances:

```js
import { Api } from "@data-provider/axios";

const booksCollection = new Api("/books", {
  tags: ["library"]
});

const bookInfo = new Api("/book/:id", {
  tags: ["goodReads"]
});

const usersCollection = new Api("/users", {
  tags: ["library", "library-auth"]
});
```

Now, you can use the [`sources` method of the "Data Provider" library][data-provider-sources-docs-url] to configure your api instances depending of their tags:

```js
import { sources } from "@data-provider/core";

sources.getByTag("api").config({ retries: 5 }); // will apply this config to all apis

sources.getByTag("library").config({ baseUrl: "https://foo-library.com/api" });

sources.getByTag("goodReads").config({ baseUrl: "https://www.goodreads.com" });
```

You can use the `apis` method of this library to add or set headers to your api instances depending of their tags:

> Use the `setHeaders` method to define headers only for certain tagged apis:

```js
import { apis } from "@data-provider/axios";

// Redefine all headers
apis.setHeaders({ "x-application": "foo" });

// Add headers only for apis tagged as "library-auth"
apis.addHeaders({ Authentication: "Bearer foo-token" }, ["library-auth"]);
```

### Priority of tags

Take into account that, when invoking to the `config` method, the api instance configuration is extended with the provided one. The same principle is applied when configuring apis based on their tags. As many tags can be defined for a single api, the order of that tags is relevant when there are different values for the same option in different tags. The last provided tag has priority in case of conflict:

```js
import { sources } from "@data-provider/core";
import { Api } from "@data-provider/axios";

sources.getByTag("foo-tag-1").config({ retries: 5 });
sources.getByTag("foo-tag-2").config({ retries: 4 });

const fooApi1 = new Api("/foo-url-1", {
  tags: ["foo-tag-1", "foo-tag-2"] // This api wil retry 4 times
});

const fooApi2 = new Api("/foo-url-2", {
  tags: ["foo-tag-2", "foo-tag-1"] // This api wil retry 5 times
});
```

[data-provider-sources-docs-url]: https://github.com/data-provider/core/blob/master/docs/sources/api.md

