import { Storage } from "./Storage";

export class SessionStorage extends Storage {
  constructor(namespace, defaultValue, options) {
    super(namespace, defaultValue, "sessionStorage", options);
  }
}
