import { Like } from ".";

export type User = {
  id: string;
  name: string;
  comments: Comment[];
  likes: Like[];
};
