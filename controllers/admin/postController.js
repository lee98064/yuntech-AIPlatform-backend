const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Post } = require("../../models");

router.get("/posts", async (req, res) => {
  const posts = await Post.findAll();

  return res.json(posts);
});

router.get("/posts/:id", async (req, res) => {
  const post = await Post.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (post == null) {
    return res.status(404).json({
      status: false,
      message: "此貼文不存在！",
    });
  }

  return res.json(post);
});

router.post("/posts", async (req, res) => {
  const { title, content, isOpen } = req.body;
  const post = await Post.create({
    title,
    content,
    isOpen,
  });

  if (post == null) {
    return res.status(404).json({
      status: false,
      message: "此公告不存在！",
    });
  }

  return res.json(post);
});

router.delete("/posts/:id", async (req, res) => {
  const post = await Post.destory({
    where: {
      id: req.params.id,
    },
  });

  return res.sendStatus(200);
});

router.patch("/posts/:id", async (req, res) => {
  const { title, content, isOpen } = req.body;
  const post = await Post.update(
    { title, content, isOpen },
    {
      where: {
        id: req.params.id,
      },
    }
  );

  return res.json(post);
});

module.exports = router;
