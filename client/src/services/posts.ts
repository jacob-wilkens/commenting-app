import { makeRequest } from ".";
import { Post } from "../types";

export const getPosts = () => {
  return makeRequest<Post[]>("/posts");
};

export const getPost = (id: string) => {
  return makeRequest<Post>(`/posts/${id}`);
};
