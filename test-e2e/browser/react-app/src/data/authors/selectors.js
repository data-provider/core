import { Selector } from "@data-provider/core";

import { authorsProvider } from "./providers";

export const authorsSearch = new Selector(authorsProvider, (queryValue, authorsResults) => {
  if (!queryValue.search.length) {
    return [];
  }
  return authorsResults.filter(function (author) {
    return author.name.toLowerCase().indexOf(queryValue.search.toLowerCase()) > -1;
  });
});
