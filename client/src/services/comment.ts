import { makeRequest } from ".";
import { CommentDelete, CommentPut, Comment, ToggleLike } from "../types";

export const createComment = (postId: string, message: string, parentId?: string) => {
  return makeRequest<Comment>(`posts/${postId}/comments`, {
    method: "POST",
    data: { message, parentId },
  });
};

export const updateComment = (postId: string, message: string, id: string) => {
  return makeRequest<CommentPut>(`posts/${postId}/comments/${id}`, {
    method: "PUT",
    data: { message },
  });
};

export const deleteComment = (postId: string, id: string) => {
  return makeRequest<CommentDelete>(`posts/${postId}/comments/${id}`, {
    method: "DELETE",
  });
};

export const toggleCommentLike = (postId: string, id: string) => {
  return makeRequest<ToggleLike>(`/posts/${postId}/comments/${id}/toggleLike`, { method: "POST" });
};
