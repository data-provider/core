import { SelectorV3 } from "@data-provider/core";

import { authorsProvider } from "./providers";

export const authorsSearch = new SelectorV3(authorsProvider, function (query, authorsResults) {
  if (!query.search.length) {
    return [];
  }
  return authorsResults.filter(function (author) {
    return author.name.toLowerCase().indexOf(query.search.toLowerCase()) > -1;
  });
});
