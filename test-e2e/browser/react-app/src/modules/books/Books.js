import { booksWithAuthorName } from "data/books";

import BooksList from "modules/books-list";
import SectionContainer from "components/section-container";
import ItemsTitle from "components/items-title";
import ItemsListContainer from "components/items-list-container";
import Placeholders from "components/placeholders";
import { useRefresh, useData, useLoading, useLoaded } from "helpers/data-provider";

import BookNew from "./modules/book-new";

const Books = () => {
  useRefresh(booksWithAuthorName);
  const books = useData(booksWithAuthorName);
  const loading = useLoading(booksWithAuthorName);
  const loaded = useLoaded(booksWithAuthorName);

  console.log("Rendering books", loading, books, loaded);

  return (
    <SectionContainer loading={loading} id="books-column">
      <ItemsTitle title="Books" />
      {loaded ? (
        <ItemsListContainer id="books-container">
          <BooksList books={books} />
        </ItemsListContainer>
      ) : (
        <Placeholders id="books-placeholder" />
      )}
      <BookNew />
    </SectionContainer>
  );
};

export default Books;
