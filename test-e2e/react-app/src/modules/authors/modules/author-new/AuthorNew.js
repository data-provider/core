import React, { useState, useCallback } from "react";

import { createAuthor } from "data/authors";
import SaveButton from "components/save-button";

const AuthorNew = () => {
  const [currentName, changeCurrentName] = useState("");

  const handleChange = useCallback((e) => {
    changeCurrentName(e.target.value);
  }, []);
  const save = useCallback(() => {
    if (currentName.length < 1) {
      alert("Please enter valid author name");
    } else {
      createAuthor(currentName);
      changeCurrentName("");
    }
  }, [currentName]);

  return (
    <div className="new">
      <input
        type="text"
        id="author-new"
        value={currentName}
        placeholder="New author"
        onChange={handleChange}
      />
      <SaveButton id="author-submit" onClick={save} />
    </div>
  );
};

export default AuthorNew;
