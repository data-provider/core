import { providers } from "@data-provider/core";

providers.getByTag("axios").config({
  baseUrl: "http://localhost:3100",
});
