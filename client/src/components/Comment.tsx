import { Comment as CommentType } from "../types";
import { CommentForm, CommentList, IconBtn } from ".";
import { FaHeart, FaReply, FaEdit, FaTrash, FaRegHeart } from "react-icons/fa";
import { usePost } from "../contexts";
import { useState } from "react";
import { createComment, deleteComment, updateComment, toggleCommentLike } from "../services";
import { useUser } from "../hooks";
import { useMutation } from "@tanstack/react-query";

type props = {
  comment: CommentType;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export const Comment = ({ comment }: props) => {
  const { id, message, user, createdAt, likeCount, likedByMe } = comment;

  const [areChildrenHidden, setAreChildrenHidden] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { post, getReplies, createLocalComment, updateLocalComment, deleteLocalComment, toggleLocalCommentLike } = usePost();

  const currentUser = { id: "8c20de6c-be7f-4509-a5fd-16c1df3b4166" }; /*useUser()*/

  const childComments = getReplies(id);

  const onCommentReply = async (message: string) => {
    const comment = await createComment(post?.id!, message, id);
    if (comment instanceof Error) throw comment;
    setIsReplying(false);
    createLocalComment(comment);
  };

  const onCommentUpdate = async (message: string) => {
    const result = await updateComment(post?.id!, message, id);
    if (result instanceof Error) throw result;
    setIsEditing(false);
    updateLocalComment(id, message);
  };

  const onCommentDelete = async () => {
    const result = await deleteComment(post?.id!, id);
    if (result instanceof Error) throw result;
    deleteLocalComment(id);
    return result;
  };

  const onToggleCommentLike = async () => {
    const comment = await toggleCommentLike(post?.id!, id);
    if (comment instanceof Error) throw comment;
    toggleLocalCommentLike(id, comment.addLike);
    return comment;
  };

  const onCommentUpdateMutation = useMutation(onCommentUpdate);
  const onToggleCommentLikeMutation = useMutation(onToggleCommentLike);
  const onCommentDeleteMutation = useMutation(onCommentDelete);
  const onCommentReplyMutation = useMutation(onCommentReply);

  return (
    <>
      <div className={"comment"}>
        <div className={"header"}>
          <span className={"name"}>{user.name}</span>
          <span className={"date"}>{dateFormatter.format(Date.parse(createdAt.toString()))}</span>
        </div>
        {isEditing ? <CommentForm autoFocus initialValue={message} onSubmit={onCommentUpdateMutation} /> : <div className="message">{message}</div>}
        <div className={"footer"}>
          <IconBtn
            Icon={likedByMe ? FaHeart : FaRegHeart}
            aria-label={likedByMe ? "Unlike" : "Like"}
            disabled={onToggleCommentLikeMutation.isLoading}
            onClick={async () => await onToggleCommentLikeMutation.mutateAsync()}
          >
            {likeCount}
          </IconBtn>
          <IconBtn
            Icon={FaReply}
            aria-label={isReplying ? "Cancel Reply" : "Reply"}
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
          />
          {user.id === currentUser.id && (
            <>
              <IconBtn
                Icon={FaEdit}
                aria-label={isEditing ? "Cancel Edit" : "Edit"}
                onClick={() => setIsEditing((prev) => !prev)}
                isActive={isEditing}
              />
              <IconBtn
                Icon={FaTrash}
                disabled={onCommentDeleteMutation.isLoading}
                onClick={async () => await onCommentDeleteMutation.mutateAsync()}
                aria-label="Delete"
                color="danger"
              />
            </>
          )}
        </div>
        <>
          {onCommentDeleteMutation.error && (
            <div className={"error-msg mt-1"}>
              {
                /* @ts-ignore */
                onCommentDeleteMutation.error.message
              }
            </div>
          )}
        </>
      </div>
      {isReplying && (
        <div className={"mt-1 ml-3"}>
          <CommentForm autoFocus onSubmit={onCommentReplyMutation} />
        </div>
      )}
      {typeof childComments !== "undefined" && childComments.length > 0 && (
        <>
          <div className={`nested-comments-stack ${areChildrenHidden ? "hide" : ""}`}>
            <button className={"collapse-line"} aria-label="Hide Replies" onClick={() => setAreChildrenHidden(true)} />
            <div className={"nested-comments"}>
              <CommentList comments={childComments} />
            </div>
          </div>
          <button className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`} onClick={() => setAreChildrenHidden(false)}>
            Show Replies
          </button>
        </>
      )}
    </>
  );
};
