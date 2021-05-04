const express = require("express");

const { randomBytes } = require("crypto");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();

// middlewares

app.use(express.json());
app.use(cors());

const commentsByPostId = {};

// To get comments in a post

app.get("/posts/:id/comments", (req, res) => {
  console.log("comment data", commentsByPostId);
  res.send(commentsByPostId[req.params.id] || []);
});

// comment creation and send to event bus

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  console.log("content>>", content);

  const comments = commentsByPostId[req.params.id] || [];
  console.log("comments>>", comments);
  // []
  comments.push({ id: commentId, content, status: "pending" });
  //comment =>  [{ id: commentId, content}]
  commentsByPostId[req.params.id] = comments;

  // commentsByPostId: {id} = comments
  // {id: comments}

  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending",
    },
  });

  res.status(201).send(comments);
});

//  event received from event bus

app.post("/events", async (req, res) => {
  console.log("Received Event", req.body.type);

  const { type, data } = req.body;

  //  send to event bus for moderation
  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    comment.status = status;

    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  res.send({});
});

app.listen(4001, () => console.log("Listening on port 4001"));
