import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getPosts } from "../services";
import { Post } from "../types";

export const PostList = () => {
  let posts: Post[];

  const { isLoading, isError, data, error } = useQuery<Post[]>(["posts"], async () => {
    const result = await getPosts();

    if (result instanceof Error) throw result;

    return result;
  });

  if (isLoading) return <h1>Loading</h1>;

  if (isError) {
    let e: any = error;
    return <h1 className="error-msg">{e.message as string}</h1>;
  }

  posts = data;

  if (!posts) return <>Loading</>;

  const renderedPosts = posts.map((post) => {
    return (
      <h1 key={post.id}>
        <Link href={`posts/${post.id}`}>{post.title}</Link>
      </h1>
    );
  });

  return <>{renderedPosts}</>;
};
