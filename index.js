const express = require("express");

const { randomBytes } = require("crypto");
const cors = require("cors");

const app = express();

// middlewares

app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  console.log("comment data", commentsByPostId);
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  console.log("content>>", content);

  const comments = commentsByPostId[req.params.id] || [];
  console.log("comments>>", comments);
  comments.push({ id: commentId, content });

  commentsByPostId[req.params.id] = comments;

  res.status(201).send(comments);
});

app.listen(4001, () => console.log("Listening on port 4001"));
