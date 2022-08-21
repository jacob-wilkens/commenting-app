import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import fastify from "fastify";

dotenv.config();

const app = fastify();

app.register(sensible);
app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});
app.register(cookie, { secret: process.env.COOKIE_SECRET });

const prisma = new PrismaClient();

//
const CURRENT_USER_ID = "8c20de6c-be7f-4509-a5fd-16c1df3b4166";

const COMMENT_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

app.addHook("onRequest", (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID) {
    req.cookies.userId = CURRENT_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", CURRENT_USER_ID);
  }
  done();
});

app.get("/users", async (req, res) => {
  return await commitToDb(prisma.user.findMany());
});

app.get("/posts", async (req, res) => {
  return await commitToDb(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.get("/posts/:id", async (req, res) => {
  const { params, cookies }: any = req;

  const id: string = params.id;

  return await commitToDb(
    prisma.post.findUnique({
      where: {
        id: id,
      },
      select: {
        body: true,
        title: true,
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            ...COMMENT_SELECT_FIELDS,
            _count: { select: { likes: true } },
          },
        },
      },
    })
  ).then(async (post) => {
    const likes = await prisma.like.findMany({
      where: { userId: cookies.userId, commentId: { in: post.comments.map((comment: any) => comment.id) } },
    });

    return {
      ...post,
      comments: post.comments.map((comment: any) => {
        const { _count, ...commentFields } = comment;
        return {
          ...commentFields,
          likedByMe: likes.find((like) => like.commentId === comment.id),
          likeCount: _count.likes,
        };
      }),
    };
  });
});

app.post("/posts/:id/comments", async (req, res) => {
  const { body, cookies, params }: any = req;

  if (body.message === "" || body.message == null) return res.send(app.httpErrors.badRequest("Message is required"));

  return await commitToDb(
    prisma.comment
      .create({
        data: {
          message: body.message,
          userId: cookies.userId,
          parentId: body.parentId,
          postId: params.id,
        },
        select: COMMENT_SELECT_FIELDS,
      })
      .then((comment) => {
        return {
          ...comment,
          likeCount: 0,
          likedByMe: false,
        };
      })
  );
});

app.put("/posts/:postId/comments/:commentId", async (req, res) => {
  const { body, cookies, params }: any = req;

  if (body.message === "" || body.message == null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }

  const user = await prisma.comment.findUnique({
    where: { id: params.commentId },
    select: { userId: true },
  });

  const userId: string | undefined = user ? user.userId : undefined;

  if (userId !== cookies.userId) {
    return res.send(app.httpErrors.unauthorized("You do not have permission to edit this message"));
  }

  return await commitToDb(
    prisma.comment.update({
      where: { id: params.commentId },
      data: { message: body.message },
      select: { message: true },
    })
  );
});

app.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const { params }: any = req;

  const user = await prisma.comment.findUnique({
    where: { id: params.commentId },
    select: { userId: true },
  });

  const userId: string | undefined = user ? user.userId : undefined;

  if (userId !== req.cookies.userId) {
    return res.send(app.httpErrors.unauthorized("You do not have permission to delete this message"));
  }

  return await commitToDb(
    prisma.comment.delete({
      where: { id: params.commentId },
      select: { id: true },
    })
  );
});

app.post("/posts/:postId/comments/:commentId/toggleLike", async (req, res) => {
  const { params, cookies }: any = req;

  const data = {
    commentId: params.commentId,
    userId: cookies.userId,
  };

  const like = await prisma.like.findUnique({
    where: { userId_commentId: data },
  });

  if (like == null) {
    return await commitToDb(prisma.like.create({ data })).then(() => {
      return { addLike: true };
    });
  } else {
    return await commitToDb(prisma.like.delete({ where: { userId_commentId: data } })).then(() => {
      return { addLike: false };
    });
  }
});

const commitToDb = async (promise: Promise<any>) => {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
};

app.listen({ port: Number(process.env.PORT) || 3001, host: "0.0.0.0" }, () => {
  console.log(`Listening on Port ${process.env.PORT}`);
});
