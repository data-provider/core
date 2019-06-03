import { Storage } from "./Storage";

export class SessionStorage extends Storage {
  constructor(namespace, defaultValue, root) {
    super(namespace, defaultValue, "sessionStorage", root);
  }
}
