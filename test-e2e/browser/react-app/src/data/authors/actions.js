import { authorsProvider } from "./providers";

export const deleteAuthor = authorId => {
  return authorsProvider.delete(authorId);
};
