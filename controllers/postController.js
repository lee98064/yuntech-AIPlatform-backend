const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("../services/jwt");
const { Op } = require("sequelize");
const { Post } = require("../models");

router.get("/posts", async (req, res) => {
  let rawPosts = await Post.findAll({
    attributes: ["id", "title", "content", "createdAt", "updatedAt"],
    where: {
      isOpen: 1,
    },
  });
  let posts = rawPosts.map((post) => post.dataValues);
  return res.status(200).json(posts);
});

router.get("/posts/:id", async (req, res) => {
  let post = await Post.findOne({
    attributes: ["id", "title", "content", "createdAt", "updatedAt"],
    where: { id: req.params.id, isOpen: 1 },
  });

  if (post === null) {
    return res.status(404).json({
      message: "Not Found!",
    });
  }

  return res.status(200).json(post);
});

module.exports = router;
