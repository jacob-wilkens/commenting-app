import { User } from ".";

export type Comment = {
  id: string;
  message: string;
  createdAt: Date;
  user: User;
  parentId?: string | null;
  likeCount: number;
  likedByMe: boolean;
};

export type CommentPut = {
  message: string;
};

export type CommentDelete = {
  id: string;
};

export type ToggleLike = {
  addLike: boolean;
};
