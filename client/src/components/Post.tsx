import { CommentList } from ".";
import { usePost } from "../contexts";
import { CommentForm } from "./CommentForm";
import { createComment as postComment } from "../services";
import { useMutation } from "@tanstack/react-query";

export const Post = () => {
  const { post, rootComments } = usePost();

  const createComment = (message: string) => postComment(post?.id || "", message, undefined);

  const onCommentCreate = useMutation(createComment);

  return (
    <>
      <h1>{post?.title}</h1>
      <article>{post?.body}</article>
      <h3 className="comments-title">Comments</h3>
      <section>
        <CommentForm onSubmit={onCommentCreate} />
        {rootComments != null && rootComments.length > 0 && (
          <div className="mt-4">
            <CommentList comments={rootComments} />
          </div>
        )}
      </section>
    </>
  );
};
