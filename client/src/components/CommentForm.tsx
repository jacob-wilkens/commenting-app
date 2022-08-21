import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { usePost } from "../contexts";

type props<T> = {
  onSubmit: UseMutationResult<T, unknown, string, unknown>;
  initialValue?: string;
  autoFocus?: boolean;
};

export const CommentForm = <T,>({ initialValue = "", autoFocus = false, onSubmit }: props<T>) => {
  const [message, setMessage] = useState(initialValue);
  const { setRetchPost } = usePost();

  const { isLoading, isError, error, mutateAsync, reset } = onSubmit;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await mutateAsync(message);
    setMessage("");
    reset();
    setRetchPost(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-form-row">
        <textarea autoFocus={autoFocus} className="message-input" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className={"btn"} disabled={isLoading} type="submit">
          {isLoading ? "Loading" : "Post"}
        </button>
      </div>
      {isError && (
        <div className={"error-msg"}>
          {
            /*@ts-ignore*/
            error.message
          }
        </div>
      )}
    </form>
  );
};
