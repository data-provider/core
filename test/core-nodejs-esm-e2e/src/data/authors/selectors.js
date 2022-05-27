import { Selector } from "@data-provider/core/dist/index.esm";

import { authorsProvider } from "./providers";

export const authorsSearch = new Selector(authorsProvider, function (query, authorsResults) {
  if (!query.search.length) {
    return [];
  }
  return authorsResults.filter(function (author) {
    return author.name.toLowerCase().indexOf(query.search.toLowerCase()) > -1;
  });
});
