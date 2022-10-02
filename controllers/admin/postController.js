const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Post } = require("../../models");
const sequelize = require("sequelize");

router.get("/posts", async (req, res) => {
  const posts = await Post.findAll({
    order: [["id", "DESC"]],
    attributes: [
      "id",
      "title",
      "content",
      [
        sequelize.fn(
          "strftime",
          "%Y-%m-%d %H:%M:%S",
          sequelize.col("createdAt")
        ),
        "dateTime",
      ],
      "isOpen",
      "createdAt",
      "updatedAt",
    ],
  });

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
  const { title, content } = req.body;
  const post = await Post.create({
    title,
    content,
    isOpen: true,
  });

  if (post == null) {
    return res.status(404).json({
      status: false,
      message: "此公告不存在！",
    });
  }

  return res.json(post);
});

router.patch("/posts/:id/hide", async (req, res) => {
  const post = await Post.update(
    { isOpen: false },
    {
      where: {
        id: req.params.id,
      },
    }
  );

  return res.json(post);
});

router.patch("/posts/:id/show", async (req, res) => {
  const post = await Post.update(
    { isOpen: true },
    {
      where: {
        id: req.params.id,
      },
    }
  );

  return res.json(post);
});

router.delete("/posts/:id", async (req, res) => {
  const post = await Post.destroy({
    where: {
      id: req.params.id,
    },
  });

  return res.sendStatus(200);
});

router.patch("/posts/:id", async (req, res) => {
  const { title, content } = req.body;
  const post = await Post.update(
    { title, content },
    {
      where: {
        id: req.params.id,
      },
    }
  );

  return res.json(post);
});

module.exports = router;
