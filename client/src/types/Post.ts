import { Comment } from ".";

export type Post = {
  id: string;
  title: string;
  body: string;
  comments: Comment[];
};
