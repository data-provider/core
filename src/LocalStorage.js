import { Storage } from "./Storage";

export class LocalStorage extends Storage {
  constructor(namespace, defaultValue, root) {
    super(namespace, defaultValue, "localStorage", root);
  }
}
