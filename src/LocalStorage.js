import { Storage } from "./Storage";

export class LocalStorage extends Storage {
  constructor(namespace, defaultValue, options) {
    super(namespace, defaultValue, "localStorage", options);
  }
}
