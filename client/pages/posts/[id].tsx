import type { NextPage } from "next";
import { PostProvider } from "../../src/contexts";
import { Post as PostComponent } from "../../src/components";

const Post: NextPage = () => {
  return (
    <div className="container">
      <PostProvider>
        <PostComponent />
      </PostProvider>
    </div>
  );
};

export default Post;
