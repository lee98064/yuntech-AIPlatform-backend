const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Student, Group } = require("../../models");

router.get("/group", async (req, res) => {
  const groups = await Group.findAll({
    include: [
      {
        attributes: {
          exclude: [
            "studentImg",
            "password",
            "GroupId",
            "createdAt",
            "updatedAt",
          ],
        },
        model: Student,
      },
    ],
  });

  return res.json(groups);
});

module.exports = router;
