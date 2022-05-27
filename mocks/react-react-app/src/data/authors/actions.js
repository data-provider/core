import { authorsProvider } from "./providers";

export const deleteAuthor = (authorId) => {
  return authorsProvider.delete(authorId);
};

export const createAuthor = (authorName) => {
  return authorsProvider.create({
    name: authorName,
  });
};
