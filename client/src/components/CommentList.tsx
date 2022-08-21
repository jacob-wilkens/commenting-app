import { Comment } from "../types";
import { Comment as CommentComponent } from ".";

type Props = {
  comments: Comment[];
};

export const CommentList = ({ comments }: Props) => {
  const renderedComments = comments.map((comment) => {
    return (
      <div key={comment.id} className="comment-stack">
        <CommentComponent comment={comment} />
      </div>
    );
  });
  return <>{renderedComments}</>;
};
