const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("../services/jwt");
const { Op } = require("sequelize");
const { Post } = require("../models");
const sequelize = require("sequelize");

router.get("/posts", async (req, res) => {
  let rawPosts = await Post.findAll({
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
      "createdAt",
      "updatedAt",
    ],
    where: {
      isOpen: 1,
    },
  });
  let posts = rawPosts.map((post) => post.dataValues);
  return res.status(200).json(posts);
});

router.get("/posts/:id", async (req, res) => {
  let post = await Post.findOne({
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
      "createdAt",
      "updatedAt",
    ],
    where: { id: req.params.id, isOpen: true },
  });

  if (post == null) {
    return res.status(404).json({
      message: "Not Found!",
    });
  }

  return res.status(200).json(post);
});

module.exports = router;
