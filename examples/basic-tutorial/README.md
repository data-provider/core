# Data Provider basic tutorial

This folder contains the source code of the [data-provider basic tutorial](https://data-provider.javierbrea.com/docs/basics-intro).

# Requirements

Running this example requires to have installed [Pnpm v6.x][https://pnpm.io/installation]


# Usage

Run the next command __in the root folder of the monorepo__ to start `json-server` and run the app:

```bash
pnpm nx start basic-tutorial
```

Remember that modifications made using the app will be saved into the `db.json` file, so remember to restore it to its initial state once you close the app using:

```bash
git checkout db.json
```
