import List from "./common/List";

class AuthorsLoaded extends List {
  constructor() {
    super({
      COLUMN: "#authors-loaded-column",
      CONTAINER: "#authors-loaded-container",
    });
  }
}

export default AuthorsLoaded;
