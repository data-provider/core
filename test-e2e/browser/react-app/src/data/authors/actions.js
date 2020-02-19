import { authorsProvider } from "./providers";

export const deleteAuthor = authorId => {
  return authorsProvider.delete(authorId);
};

export const createAuthor = name => {
  return authorsProvider.create({
    name
  });
};
