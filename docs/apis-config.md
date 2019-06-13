## Configuring multiple apis instances at a time

Use the `tags` option to categorize your api instances:

```js
import { Api } from "@xbyorange/mercury-api";

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

Now, you can use the `apis` method to configure and set headers of your api instances depending of their tags:

```js
import { apis } from "@xbyorange/mercury-api";

apis.config({ retries: 5 }); // will apply this config to all apis

apis.config({ baseUrl: "https://foo-library.com/api" }, ["library"]);

apis.config({ baseUrl: "https://www.goodreads.com" }, ["goodReads"]);
```

> Use the `setHeaders` method to define headers only for certain tagged apis:

```js
apis.addHeaders({ Authentication: "Bearer foo-token" }, ["library-auth"]);
```

### Priority of tags

Take into account that, when invoking to the `config` method, the api instance configuration is extended with the provided one. The same principle is applied when configuring apis based on their tags. As many tags can be defined for a single api, the order of that tags is relevant when there are different values for the same option in different tags. The last provided tag has priority in case of conflict:

```js
import { apis, Api } from "@xbyorange/mercury-api";

apis.config({ retries: 5 }, ["foo-tag-1"]);
apis.config({ retries: 4 }, ["foo-tag-2"]);

const fooApi1 = new Api("/foo-url-1", {
  tags: ["foo-tag-1", "foo-tag-2"] // This api wil retry 4 times
});

const fooApi2 = new Api("/foo-url-2", {
  tags: ["foo-tag-2", "foo-tag-1"] // This api wil retry 5 times
});
```

