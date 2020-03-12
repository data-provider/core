import React, { useState, useCallback } from "react";

import { createBook } from "data/books";
import SaveButton from "components/save-button";

import AuthorSelect from "modules/author-select";

const BookNew = () => {
  const [currentTitle, changeCurrentTitle] = useState("");
  const [currentAuthor, changeCurrentAuthor] = useState("-");

  const handleTitleChange = useCallback(e => {
    changeCurrentTitle(e.target.value);
  }, []);
  const handleAuthorChange = useCallback(e => {
    console.log(e.target.value);
    changeCurrentAuthor(e.target.value);
  }, []);

  const save = useCallback(() => {
    if (currentTitle.length < 1 || currentAuthor === "-") {
      alert("Please enter valid book and author");
    } else {
      createBook({
        title: currentTitle,
        author: currentAuthor
      });
      changeCurrentTitle("");
    }
  }, [currentTitle, currentAuthor]);

  return (
    <div className="new">
      <input
        type="text"
        id="book-new"
        placeholder="New book"
        value={currentTitle}
        onChange={handleTitleChange}
      />
      <AuthorSelect onChange={handleAuthorChange} />
      <SaveButton id="book-submit" onClick={save} />
    </div>
  );
};

export default BookNew;
