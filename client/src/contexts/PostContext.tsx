import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Post, Comment } from "../types";
import { getPost } from "../services";

const Context = createContext<PostType>(undefined!);

type Props = {
  children: ReactNode;
};

type PostType = {
  post: Post | undefined;
  rootComments: Comment[];
  setRetchPost: Dispatch<SetStateAction<boolean>>;
  getReplies: (parentId: string) => Comment[];
  createLocalComment: (comment: Comment) => void;
  updateLocalComment: (id: string, message: string) => void;
  deleteLocalComment: (id: string) => void;
  toggleLocalCommentLike: (id: string, addLike: boolean) => void;
};

export const usePost = () => {
  return useContext(Context);
};

export const PostProvider = ({ children }: Props) => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [refetchPost, setRetchPost] = useState(false);

  /*Fetch Post */
  const {
    isLoading,
    isError,
    data: post,
    refetch,
  } = useQuery<Post>(
    [id],
    async () => {
      const resp = await getPost((id as string) || "");

      if (resp instanceof Error) throw resp;

      let post: Post = { id: id || "", body: resp.body, comments: resp.comments, title: resp.title };

      setRetchPost(false);

      return post;
    },
    { enabled: !!id }
  );

  useEffect(() => {
    if (refetchPost) refetch();
  }, [refetchPost]);

  const [comments, setComments] = useState<Comment[]>([]);
  useEffect(() => {
    if (comments == null || !post) return;
    setComments(post.comments);
  }, [post?.comments]);

  const commentsByParentId = useMemo(() => {
    if (comments.length === 0) return {};
    const group: { [key: string]: Comment[] } = {};

    comments.forEach((comment) => {
      group[comment.parentId!] ||= [];
      group[comment.parentId!]?.push(comment);
    });

    return group;
  }, [comments]);

  const getReplies = (parentId: string) => {
    return commentsByParentId[parentId];
  };

  const createLocalComment = (comment: Comment) => {
    setComments((prevComments) => {
      return [comment, ...prevComments];
    });
  };

  const updateLocalComment = (id: string, message: string) => {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (comment.id === id) return { ...comment, message };
        else return comment;
      });
    });
  };

  const deleteLocalComment = (id: string) => {
    setComments((prevComments) => {
      return prevComments.filter((comment) => comment.id !== id);
    });
  };

  const toggleLocalCommentLike = (id: string, addLike: boolean) => {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (id === comment.id) {
          if (addLike) {
            return {
              ...comment,
              likeCount: comment.likeCount + 1,
              likedByMe: true,
            };
          } else {
            return {
              ...comment,
              likeCount: comment.likeCount - 1,
              likedByMe: false,
            };
          }
        } else {
          return comment;
        }
      });
    });
  };

  return (
    <Context.Provider
      value={{
        post,
        rootComments: commentsByParentId["null"],
        setRetchPost: setRetchPost,
        getReplies: getReplies,
        createLocalComment: createLocalComment,
        updateLocalComment: updateLocalComment,
        deleteLocalComment: deleteLocalComment,
        toggleLocalCommentLike: toggleLocalCommentLike,
      }}
    >
      {isLoading ? <h1>Loading</h1> : isError ? <h1 className="error-msg">{"There was an error"}</h1> : children}
    </Context.Provider>
  );
};
