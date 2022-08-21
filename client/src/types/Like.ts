import { User } from ".";

export type Like = {
  user: User;
  comment: Comment;
  userId: string;
  id: string;
};
