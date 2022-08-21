import type { NextPage } from "next";
import { PostList } from "../../src/components";

const Posts: NextPage = () => {
  return (
    <div className="container">
      <PostList />
    </div>
  );
};

export default Posts;
