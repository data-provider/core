# Data Provider custom origins examples

This folder contains an example of how to implement a data-provider custom origin addon.

The source code of the addon (an [example from the data-provider website](https://www.data-provider.org/docs/addons-creating-origin-addons)) is in the [./src/Fetcher.js](./src/Fetcher.js) file , and usage examples are in the [./usage-examples](./usage-examples) folder.

# Requirements

Running this example requires to have installed [Pnpm v6.x][https://pnpm.io/installation]

# Usage

Run the next command __in the root folder of the monorepo__ to build the example dependencies:

```bash
pnpm nx build custom-origins
```

Then, you can use `Node.js  to run the different code examples __in the [./usage-examples](./usage-examples) folder__:

```sh
node usage-of-update-method.js
```

```sh
node usage-with-promises.js
```

```sh
node usage-with-selectors.js
```
